// Shared across all composable instances on the client
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

  async function _doSubscribe(authHeader) {
    try {
      const { key } = await $fetch('/api/push/vapid-public-key')
      if (!key) return false

      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        })
      }

      const json = sub.toJSON()
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      return true
    } catch {
      return false
    }
  }

  // Called from UI button — requests permission then subscribes
  async function subscribe(authHeader) {
    if (!isSupported.value || !notifSupported) return false
    const perm = await Notification.requestPermission()
    permission.value = perm
    if (perm !== 'granted') return false
    return _doSubscribe(authHeader)
  }

  // Called silently on mount — only proceeds if already granted, never prompts
  async function resubscribeIfGranted(authHeader) {
    if (!isSupported.value || !notifSupported) return
    if (Notification.permission !== 'granted') return
    permission.value = 'granted'
    _doSubscribe(authHeader)
  }

  async function unsubscribe(authHeader) {
    if (!isSupported.value) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await $fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: { endpoint: sub.endpoint },
      })
      await sub.unsubscribe()
      if (notifSupported) permission.value = Notification.permission
    } catch { /* swallow */ }
  }

  return { isSupported, permission, subscribe, resubscribeIfGranted, unsubscribe }
}
