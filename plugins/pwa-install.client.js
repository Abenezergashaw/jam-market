export default defineNuxtPlugin(() => {
  window.__pwaPrompt = null
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.__pwaPrompt = e
    window.dispatchEvent(new Event('pwa-install-available'))
  })
})
