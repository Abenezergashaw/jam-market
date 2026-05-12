export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((reg) => {
      console.log('[SW] registered, state:', reg.active?.state ?? 'pending')
    })
    .catch((err) => {
      console.error('[SW] registration failed:', err?.message)
    })
})
