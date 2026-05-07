<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-zinc-200 shadow-lg px-4 py-3 flex items-center gap-3"
    >
      <!-- Icon -->
      <div class="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center shrink-0">
        <span class="text-white text-sm font-black leading-none">JAM</span>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-zinc-900 leading-tight">Add to Home Screen</p>
        <p class="text-[11px] text-zinc-400 leading-tight mt-0.5">Install Jam Store for a better experience</p>
      </div>

      <button
        class="shrink-0 bg-forest-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-forest-600 transition-colors"
        @click="install"
      >
        Install
      </button>

      <button
        class="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
const show = ref(false)
let deferredPrompt = null

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function dismiss() {
  show.value = false
  localStorage.setItem('pwa-install-dismissed', '1')
}

async function install() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') show.value = false
    else dismiss()
  } else {
    // Fallback for browsers that don't support beforeinstallprompt (Firefox, Safari)
    // or when the prompt is no longer available — guide the user manually
    alert('To install: open your browser menu and choose "Add to Home Screen" or "Install App".')
  }
}

onMounted(() => {
  if (isStandalone()) return
  if (localStorage.getItem('pwa-install-dismissed')) return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    show.value = true
  })

  window.addEventListener('appinstalled', () => {
    show.value = false
    deferredPrompt = null
  })

  // Show the banner even if beforeinstallprompt never fires (Firefox, Safari, or
  // when Chrome's installability criteria aren't met yet). The Install button
  // will fall back to showing instructions in those cases.
  setTimeout(() => {
    if (!show.value) show.value = true
  }, 2000)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
