const _permission = process.client && 'Notification' in window
  ? ref(Notification.permission)
  : ref('denied')

export function usePushNotifications() {
  const notifSupported = process.client && 'Notification' in window
  const pushSupported  = process.client && 'serviceWorker' in navigator && 'PushManager' in window

  const isSupported = computed(() => notifSupported && pushSupported)
  const permission  = _permission

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw     = atob(base64)
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
  }

  function waitForSW(ms = 15000) {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SW_TIMEOUT: Service worker took too long')), ms)
      ),
    ])
  }

  // Throws with a descriptive message on every failure — no silent swallowing
  async function _doSubscribe(authHeader) {
    // 1. Fetch VAPID key
    let key
    try {
      const res = await $fetch('/api/push/vapid-public-key')
      key = res.key
    } catch (e) {
      throw new Error('VAPID_FETCH: Could not reach server')
    }
    if (!key) throw new Error('VAPID_MISSING: Push not configured on server')

    // 2. Wait for service worker
    let reg
    try {
      reg = await waitForSW()
    } catch (e) {
      throw new Error('SW_TIMEOUT: Service worker not ready — try reloading the page')
    }

    // 3. Subscribe via PushManager
    // On Android, always clear any existing subscription first.
    // Stale FCM registrations cause subscribe() to return an invalid sub
    // that the server can't reach.
    let sub
    try {
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
    } catch (e) {
      const msg = e?.message ?? ''
      if (msg.includes('push service error') || msg.includes('Registration failed')) {
        throw new Error('FCM_ERROR: Google Play Services may be restricted. Go to Android Settings → Apps → Google Play Services → Battery → Unrestricted, then try again.')
      }
      throw new Error('SUBSCRIBE_ERROR: ' + msg)
    }

    // 4. Validate subscription has keys (Android sometimes returns without them)
    const json = sub.toJSON()
    if (!json.keys?.p256dh || !json.keys?.auth) {
      await sub.unsubscribe().catch(() => {})
      throw new Error('SUB_KEYS_MISSING: Subscription missing encryption keys — please try again')
    }

    // 5. Save to server
    try {
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
    } catch (e) {
      throw new Error('SAVE_ERROR: Could not save subscription — please try again')
    }
  }

  // Returns { ok, error?, code? } — never throws
  async function subscribe(authHeader) {
    if (!isSupported.value) {
      return { ok: false, code: 'NOT_SUPPORTED', error: 'Push notifications are not supported on this browser' }
    }

    // Request permission
    let perm
    try {
      perm = await Notification.requestPermission()
    } catch (e) {
      return { ok: false, code: 'PERMISSION_ERROR', error: 'Could not request notification permission' }
    }

    permission.value = perm

    if (perm === 'denied')  return { ok: false, code: 'DENIED' }
    if (perm !== 'granted') return { ok: false, code: 'DISMISSED' }

    // Subscribe
    try {
      await _doSubscribe(authHeader)
      return { ok: true }
    } catch (e) {
      const message = e?.message ?? 'Unknown error'
      const code = message.split(':')[0]
      const detail = message.includes(':') ? message.slice(code.length + 2) : message
      console.error('[push] subscribe failed:', message)
      return { ok: false, code, error: detail }
    }
  }

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
