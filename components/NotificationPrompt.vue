<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-20 sm:bottom-4 inset-x-0 mx-3 sm:mx-auto sm:max-w-sm z-50 bg-zinc-900 text-white rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Main row -->
      <div class="flex items-center gap-3 px-4 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" :class="enableError ? 'text-red-400' : 'text-brand-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <div class="flex-1 min-w-0 text-xs leading-snug">
          <span v-if="denied">
            Notifications blocked — go to <strong>Settings → Apps → Chrome → Notifications</strong> and allow.
          </span>
          <span v-else-if="!enableError">
            Enable notifications to get <strong>live order updates</strong>
          </span>
          <span v-else class="text-red-300">{{ enableError }}</span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="!denied"
            :disabled="enabling"
            class="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            @click="enable"
          >
            {{ enabling ? '…' : (enableError ? 'Retry' : 'Enable') }}
          </button>

          <button class="p-1.5 text-zinc-500 hover:text-white transition-colors" @click="dismiss">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Extended error detail (FCM / Play Services guidance) -->
      <div v-if="enableError && errorDetail" class="px-4 pb-3 text-[11px] text-zinc-400 leading-snug border-t border-zinc-800 pt-2">
        {{ errorDetail }}
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  authHeader: { type: String, required: true },
})

const { isSupported, permission, subscribe } = usePushNotifications()
const dismissed   = ref(false)
const enabling    = ref(false)
const enableError = ref('')
const errorDetail = ref('')

const denied = computed(() => permission.value === 'denied')

const show = computed(() =>
  isSupported.value &&
  permission.value !== 'granted' &&
  !dismissed.value
)

function dismiss() { dismissed.value = true }

async function enable() {
  enabling.value  = true
  enableError.value = ''
  errorDetail.value = ''

  const result = await subscribe(props.authHeader)

  enabling.value = false

  if (result.ok) {
    // Successfully subscribed — hide the prompt
    dismissed.value = true
    return
  }

  // Permission was denied → `denied` computed switches the UI automatically
  if (result.code === 'DENIED' || result.code === 'DISMISSED') return

  // Subscription failed (FCM/server error) — keep the prompt open, show error + retry
  if (result.code === 'FCM_ERROR') {
    enableError.value = 'Could not connect to Google push service'
    errorDetail.value = result.error
    return
  }

  if (result.code === 'NOT_SUPPORTED') {
    // Can't do anything — just dismiss
    dismissed.value = true
    return
  }

  enableError.value = result.error ?? 'Something went wrong — tap Retry'
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
