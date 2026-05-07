<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-zinc-200 shadow-xl px-4 py-3 flex items-center gap-3"
    >
      <!-- Icon -->
      <div class="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center shrink-0">
        <span class="text-white text-sm font-black leading-none">JAM</span>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-zinc-900 leading-tight">Add to Home Screen</p>
        <!-- iOS instruction -->
        <p v-if="isIOS" class="text-[11px] text-zinc-400 leading-tight mt-0.5">
          Tap <svg xmlns="http://www.w3.org/2000/svg" class="inline h-3 w-3 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Share then <strong>Add to Home Screen</strong>
        </p>
        <!-- Chrome/Edge native install -->
        <p v-else-if="canNativeInstall" class="text-[11px] text-zinc-400 leading-tight mt-0.5">
          Install for a faster, app-like experience
        </p>
        <!-- Firefox / other -->
        <p v-else class="text-[11px] text-zinc-400 leading-tight mt-0.5">
          Open browser menu → <strong>Install App</strong> or <strong>Add to Home Screen</strong>
        </p>
      </div>

      <!-- iOS: no button needed, instructions are enough -->
      <button
        v-if="!isIOS"
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
const canNativeInstall = ref(false)
const isIOS = ref(false)
let deferredPrompt = null

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function dismiss() {
  show.value = false
  localStorage.setItem('pwa-install-dismissed', '1')
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  if (outcome === 'accepted') {
    show.value = false
  } else {
    dismiss()
  }
}

onMounted(() => {
  if (isStandalone()) return
  if (localStorage.getItem('pwa-install-dismissed')) return

  isIOS.value = detectIOS()

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    canNativeInstall.value = true
    show.value = true
  })

  window.addEventListener('appinstalled', () => {
    show.value = false
    deferredPrompt = null
  })

  // Show for iOS and non-Chromium browsers (no beforeinstallprompt support)
  // Chrome/Edge will show via the event above; this handles everyone else
  if (isIOS.value || !('onbeforeinstallprompt' in window)) {
    setTimeout(() => {
      if (!show.value) show.value = true
    }, 3000)
  }
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
