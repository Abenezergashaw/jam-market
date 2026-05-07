export function usePushNotifications() {
  const notifSupported = process.client && 'Notification' in window
  const pushSupported = process.client && 'serviceWorker' in navigator && 'PushManager' in window

  const isSupported = computed(() => notifSupported && pushSupported)

  const permission = ref(notifSupported ? Notification.permission : 'denied')

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
  }

  async function subscribe(authHeader) {
    if (!isSupported.value) return false
    if (!notifSupported) return false

    const perm = await Notification.requestPermission()
    permission.value = perm
    if (perm !== 'granted') return false

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

  return { isSupported, permission, subscribe, unsubscribe }
}
