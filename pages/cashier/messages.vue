<template>
  <div class="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-4 lg:-m-6">
    <!-- Conversation list -->
    <div
      class="flex flex-col border-r border-zinc-200 bg-white overflow-hidden"
      :class="activeCid ? 'hidden lg:flex lg:w-[35%]' : 'flex w-full lg:w-[35%]'"
    >
      <div class="px-4 py-3 border-b border-zinc-100 shrink-0">
        <h1 class="text-base font-bold text-zinc-900">Customer Messages</h1>
      </div>

      <div v-if="loadingList" class="p-3 space-y-2">
        <div v-for="n in 4" :key="n" class="h-16 rounded-xl bg-zinc-50 animate-pulse" />
      </div>
      <div v-else-if="!conversations.length" class="flex-1 flex items-center justify-center text-sm text-zinc-400 p-6 text-center">
        No conversations yet.
      </div>
      <ul v-else class="flex-1 overflow-y-auto divide-y divide-zinc-50">
        <li
          v-for="c in conversations"
          :key="c.id"
          class="px-4 py-3.5 cursor-pointer hover:bg-zinc-50 transition-colors flex items-start gap-3"
          :class="[activeCid === c.id ? 'bg-brand-50' : '', c.unreadCount > 0 ? 'border-l-2 border-l-brand-500' : '']"
          @click="openConversation(c.id)"
        >
          <div class="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
            {{ (c.customer.firstName?.[0] ?? '?').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <p class="text-sm truncate" :class="c.unreadCount > 0 ? 'font-bold text-zinc-900' : 'font-medium text-zinc-700'">
                {{ c.customer.firstName }}{{ c.customer.lastName ? ' ' + c.customer.lastName : '' }}
              </p>
              <div class="flex items-center gap-1.5 shrink-0">
                <span v-if="c.unreadCount > 0" class="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {{ c.unreadCount }}
                </span>
                <span class="text-[10px] text-zinc-400">{{ formatTime(c.updatedAt) }}</span>
              </div>
            </div>
            <p class="text-xs text-zinc-500 truncate mt-0.5">{{ c.product?.name ?? c.subject ?? 'General inquiry' }}</p>
            <p v-if="c.lastMessage" class="text-xs text-zinc-400 truncate mt-0.5">
              {{ c.lastMessage.senderRole === 'staff' ? 'You: ' : '' }}{{ c.lastMessage.imageUrl && !c.lastMessage.body ? '📷 Image' : c.lastMessage.body }}
            </p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Chat pane -->
    <div class="flex-1 flex flex-col overflow-hidden bg-white" :class="activeCid ? 'flex' : 'hidden lg:flex'">
      <template v-if="!activeCid">
        <div class="flex-1 flex items-center justify-center text-zinc-300">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm">Select a conversation</p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="px-4 py-3 border-b border-zinc-100 shrink-0 flex items-center gap-3">
          <button class="lg:hidden text-zinc-400 hover:text-zinc-700 p-1 -ml-1" @click="activeCid = null">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
            {{ (activeConv?.customer?.firstName?.[0] ?? '?').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-zinc-900">
              {{ activeConv?.customer?.firstName }}{{ activeConv?.customer?.lastName ? ' ' + activeConv.customer.lastName : '' }}
            </p>
            <p class="text-xs text-zinc-400 truncate">
              <template v-if="activeConv?.customer?.username">@{{ activeConv.customer.username }} · </template>{{ activeConv?.product?.name ?? activeConv?.subject ?? 'General inquiry' }}
            </p>
          </div>
          <template v-if="activeConv?.product">
            <div class="hidden sm:flex items-center gap-2 shrink-0 border-l border-zinc-100 pl-3">
              <img :src="activeConv.product.imageUrl" class="w-8 h-8 rounded-lg object-cover bg-zinc-100" />
              <div>
                <p class="text-xs font-semibold text-zinc-800 truncate max-w-[120px]">{{ activeConv.product.name }}</p>
                <p class="text-xs text-zinc-400">ETB {{ Number(activeConv.product.price).toFixed(2) }}</p>
              </div>
            </div>
          </template>
        </div>

        <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div v-if="loadingMessages" class="flex items-center justify-center py-10">
            <div class="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex"
              :class="msg.senderRole === 'staff' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm"
                :class="msg.senderRole === 'staff'
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-zinc-100 text-zinc-900 rounded-bl-sm'"
              >
                <img
                  v-if="msg.imageUrl"
                  :src="msg.imageUrl"
                  class="w-48 rounded-xl object-cover mb-1 cursor-pointer"
                  @click="lightboxSrc = msg.imageUrl"
                  @error="$event.target.style.display='none'"
                />
                <p v-if="msg.body" class="whitespace-pre-wrap break-words leading-relaxed">{{ msg.body }}</p>
                <p class="text-[10px] mt-1 opacity-60 text-right">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
          </template>
        </div>

        <div class="px-3 py-3 border-t border-zinc-100 shrink-0">
          <div v-if="replyImageUrl" class="mb-2 relative inline-block">
            <img :src="replyImageUrl" class="w-16 h-16 rounded-xl object-cover border border-zinc-200" />
            <button class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center text-xs" @click="replyImageUrl = null">×</button>
          </div>
          <div class="flex items-end gap-2">
            <input ref="replyFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleImageUpload" />
            <button class="shrink-0 p-2 text-zinc-400 hover:text-zinc-700 transition-colors" :disabled="uploading" @click="replyFileInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <textarea
              v-model="replyBody"
              rows="1"
              maxlength="1000"
              placeholder="Reply…"
              class="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              @keydown.enter.exact.prevent="sendReply"
            />
            <button
              class="shrink-0 w-9 h-9 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
              :disabled="(!replyBody.trim() && !replyImageUrl) || sending || uploading"
              @click="sendReply"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="lightboxSrc" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" @click="lightboxSrc = null">
      <img :src="lightboxSrc" class="max-w-full max-h-full rounded-xl object-contain" @click.stop />
    </div>
  </Teleport>
</template>

<script setup>
definePageMeta({ middleware: ['cashier'], layout: 'cashier', ssr: false })

const adminStore = useAdminStore()
const { acknowledge } = useAdminMessageNotifier()

const conversations = ref([])
const loadingList = ref(true)
const activeCid = ref(null)
const activeConv = computed(() => conversations.value.find((c) => c.id === activeCid.value) ?? null)
const messages = ref([])
const loadingMessages = ref(false)
const messagesEl = ref(null)

const replyBody = ref('')
const replyImageUrl = ref(null)
const uploading = ref(false)
const sending = ref(false)
const replyFileInput = ref(null)
const lightboxSrc = ref(null)

let pollTimer = null

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function loadConversations() {
  try {
    const res = await $fetch('/api/admin/conversations', {
      headers: { Authorization: `Bearer ${adminStore.token}` },
    })
    conversations.value = res
  } catch { /* silent */ }
  finally { loadingList.value = false }
}

async function openConversation(id) {
  activeCid.value = id
  loadingMessages.value = true
  try {
    const res = await $fetch(`/api/admin/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${adminStore.token}` },
    })
    messages.value = res.messages
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) {
      conversations.value[idx] = { ...conversations.value[idx], ...res.conversation, unreadCount: 0 }
    }
    acknowledge()
    await nextTick()
    scrollToBottom()
    startPoll()
  } catch { /* silent */ }
  finally { loadingMessages.value = false }
}

function scrollToBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function startPoll() {
  clearInterval(pollTimer)
  pollTimer = setInterval(async () => {
    if (!activeCid.value) return
    try {
      const res = await $fetch(`/api/admin/conversations/${activeCid.value}/messages`, {
        headers: { Authorization: `Bearer ${adminStore.token}` },
      })
      const prevLen = messages.value.length
      messages.value = res.messages
      if (res.messages.length > prevLen) {
        await nextTick()
        scrollToBottom()
      }
    } catch { /* silent */ }
  }, 5000)
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/admin/conversations/upload', {
      method: 'POST', body: fd,
      headers: { Authorization: `Bearer ${adminStore.token}` },
    })
    replyImageUrl.value = res.imageUrl
  } catch (e) { alert(e?.data?.statusMessage ?? 'Upload failed') }
  finally { uploading.value = false; event.target.value = '' }
}

async function sendReply() {
  if ((!replyBody.value.trim() && !replyImageUrl.value) || sending.value) return
  sending.value = true
  try {
    const msg = await $fetch(`/api/admin/conversations/${activeCid.value}/messages`, {
      method: 'POST',
      body: { body: replyBody.value.trim() || undefined, imageUrl: replyImageUrl.value || undefined },
      headers: { Authorization: `Bearer ${adminStore.token}` },
    })
    messages.value.push(msg)
    replyBody.value = ''
    replyImageUrl.value = null
    await nextTick()
    scrollToBottom()
    const conv = conversations.value.find((c) => c.id === activeCid.value)
    if (conv) { conv.lastMessage = msg; conv.updatedAt = msg.createdAt }
  } catch (e) { alert(e?.data?.statusMessage ?? 'Failed to send') }
  finally { sending.value = false }
}

onMounted(async () => {
  acknowledge()
  await loadConversations()
})

onUnmounted(() => clearInterval(pollTimer))

useHead({ title: 'Messages — Cashier' })
</script>
