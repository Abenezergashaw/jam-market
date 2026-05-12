<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-20 sm:bottom-4 inset-x-0 mx-4 sm:mx-auto sm:max-w-sm z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl flex flex-col gap-2 shadow-xl"
    >
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <div class="flex-1 min-w-0">
          <p v-if="denied" class="text-xs leading-tight">
            Notifications blocked — enable them in your <strong>phone settings → Chrome → Notifications</strong>.
          </p>
          <p v-else class="text-xs leading-tight">
            Enable notifications to get <strong>live order updates</strong>
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="!denied"
            :disabled="enabling"
            class="bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-60"
            @click="enable"
          >
            {{ enabling ? '…' : 'Enable' }}
          </button>

          <button
            class="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Dismiss"
            @click="dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Error feedback -->
      <p v-if="enableError" class="text-[11px] text-red-400 leading-tight pl-8">{{ enableError }}</p>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  authHeader: { type: String, required: true },
})

const { isSupported, permission, subscribe } = usePushNotifications()
const dismissed = ref(false)
const enabling = ref(false)
const enableError = ref('')

const denied = computed(() => permission.value === 'denied')

const show = computed(() =>
  isSupported.value &&
  permission.value !== 'granted' &&
  !dismissed.value
)

function dismiss() {
  dismissed.value = true
}

async function enable() {
  enabling.value = true
  enableError.value = ''

  const result = await subscribe(props.authHeader)

  enabling.value = false

  if (result.ok) {
    dismissed.value = true
    return
  }

  // If permission was granted but subscription failed, still hide the prompt
  // resubscribeIfGranted will retry on next load
  if (permission.value === 'granted') {
    dismissed.value = true
    return
  }

  if (result.error === 'blocked' || result.error === 'dismissed') {
    // permission.value is already updated to 'denied', banner switches to blocked message
    return
  }

  enableError.value = result.error ?? 'Something went wrong — please try again'
}
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
