// Shared singleton — persists across composable instances on the client
const _permission = process.client && 'Notification' in window
  ? ref(Notification.permission)
  : ref('denied')

export function usePushNotifications() {
  const notifSupported = process.client && 'Notification' in window
  const pushSupported = process.client && 'serviceWorker' in navigator && 'PushManager' in window

  const isSupported = computed(() => notifSupported && pushSupported)
  const permission = _permission

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
  }

  // Resolves when SW is active, or rejects after timeout (Android can be slow)
  function waitForSW(ms = 12000) {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Service worker took too long to become active')), ms)
      ),
    ])
  }

  // Throws on any failure so callers can show meaningful errors
  async function _doSubscribe(authHeader) {
    const { key } = await $fetch('/api/push/vapid-public-key')
    if (!key) throw new Error('Push not configured on server (missing VAPID key)')

    const reg = await waitForSW()

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
    }

    const json = sub.toJSON()
    if (!json.keys?.p256dh || !json.keys?.auth) {
      throw new Error('Subscription missing keys')
    }

    await $fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
    })
  }

  // Returns { ok, error? } — never throws
  async function subscribe(authHeader) {
    if (!isSupported.value) return { ok: false, error: 'Push notifications not supported on this device' }

    let perm
    try {
      perm = await Notification.requestPermission()
    } catch (e) {
      return { ok: false, error: 'Permission request failed' }
    }

    permission.value = perm
    if (perm !== 'granted') {
      return { ok: false, error: perm === 'denied' ? 'blocked' : 'dismissed' }
    }

    try {
      await _doSubscribe(authHeader)
      return { ok: true }
    } catch (e) {
      console.error('[push] subscription failed:', e?.message)
      return { ok: false, error: e?.message ?? 'Subscription failed — please try again' }
    }
  }

  // Silent re-registration on mount when permission already granted
  async function resubscribeIfGranted(authHeader) {
    if (!isSupported.value) return
    if (Notification.permission !== 'granted') return
    permission.value = 'granted'
    try {
      await _doSubscribe(authHeader)
    } catch (e) {
      console.warn('[push] resubscribe failed:', e?.message)
    }
  }

  async function unsubscribe(authHeader) {
    if (!isSupported.value) return
    try {
      const reg = await waitForSW()
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await $fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: { endpoint: sub.endpoint },
      })
      await sub.unsubscribe()
      if (notifSupported) permission.value = Notification.permission
    } catch (e) {
      console.warn('[push] unsubscribe failed:', e?.message)
    }
  }

  return { isSupported, permission, subscribe, resubscribeIfGranted, unsubscribe }
}
