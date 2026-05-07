<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-0 inset-x-0 z-40 bg-zinc-900 text-white px-4 py-3 flex items-center gap-3 shadow-xl"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <div class="flex-1 min-w-0">
        <p v-if="denied" class="text-xs leading-tight">
          Notifications blocked — enable them in your
          <strong>browser or phone settings</strong> to get order updates.
        </p>
        <p v-else class="text-xs leading-tight">
          Enable notifications to get <strong>live order updates</strong>
        </p>
      </div>

      <button
        v-if="!denied"
        class="shrink-0 bg-amber-400 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors"
        @click="enable"
      >
        Enable
      </button>

      <button
        class="shrink-0 p-1.5 text-zinc-400 hover:text-white transition-colors"
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
const props = defineProps({
  authHeader: { type: String, required: true },
})

const { isSupported, permission, subscribe } = usePushNotifications()
const dismissed = ref(false)
const denied = computed(() => permission.value === 'denied')

const show = computed(() =>
  isSupported.value &&
  permission.value !== 'granted' &&
  !dismissed.value
)

function dismiss() {
  dismissed.value = true
  if (process.client) localStorage.setItem('notif-prompt-dismissed', '1')
}

async function enable() {
  const ok = await subscribe(props.authHeader)
  if (ok) dismissed.value = true
  // if not ok, permission is now 'denied' and the banner switches to the blocked message
}

onMounted(() => {
  if (localStorage.getItem('notif-prompt-dismissed')) dismissed.value = true
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
