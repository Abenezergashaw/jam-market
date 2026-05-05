<template>
  <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8">
    <h1 class="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">Messages</h1>

    <div class="flex flex-col sm:flex-row gap-4 h-[calc(100vh-180px)] min-h-[400px]">
      <!-- Conversation list -->
      <div class="sm:w-72 shrink-0 flex flex-col gap-2" :class="activeCid ? 'hidden sm:flex' : 'flex'">
        <!-- New Conversation button -->
        <button
          class="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
          @click="newConvOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>

        <div v-if="loadingList" class="space-y-2 mt-1">
          <div v-for="n in 3" :key="n" class="card h-16 animate-pulse bg-zinc-50" />
        </div>
        <div v-else-if="!conversations.length" class="card p-6 text-center text-sm text-zinc-400">
          No conversations yet.
        </div>
        <ul v-else class="overflow-y-auto flex-1 space-y-1">
          <li
            v-for="c in conversations"
            :key="c.id"
            class="card px-3 py-3 cursor-pointer hover:border-zinc-300 transition-all"
            :class="activeCid === c.id ? 'border-brand-300 bg-brand-50' : ''"
            @click="openConversation(c.id)"
          >
            <div class="flex items-start gap-2.5">
              <ProductImage
                v-if="c.product?.imageUrl"
                :src="c.product.imageUrl"
                class="w-9 h-9 rounded-lg object-cover bg-zinc-100 shrink-0"
              />
              <div v-else class="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-sm font-semibold text-zinc-900 truncate" :class="c.unreadCount > 0 ? 'font-bold' : ''">
                    {{ c.product?.name ?? c.subject ?? 'Conversation' }}
                  </p>
                  <span v-if="c.unreadCount > 0" class="shrink-0 min-w-[18px] h-[18px] bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {{ c.unreadCount }}
                  </span>
                </div>
                <p v-if="c.lastMessage" class="text-xs text-zinc-400 truncate mt-0.5">
                  {{ c.lastMessage.imageUrl && !c.lastMessage.body ? '📷 Image' : c.lastMessage.body }}
                </p>
                <p class="text-[10px] text-zinc-300 mt-0.5">{{ formatTime(c.updatedAt) }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Chat pane -->
      <div class="flex-1 card flex flex-col overflow-hidden" :class="activeCid ? 'flex' : 'hidden sm:flex'">
        <template v-if="!activeCid">
          <div class="flex-1 flex items-center justify-center text-zinc-300">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Chat header -->
          <div class="px-4 py-3 border-b border-zinc-100 flex items-center gap-3 shrink-0">
            <button class="sm:hidden text-zinc-400 hover:text-zinc-700 transition-colors" @click="activeCid = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img
              v-if="activeConv?.product?.imageUrl"
              :src="activeConv.product.imageUrl"
              class="w-9 h-9 rounded-lg object-cover bg-zinc-100 shrink-0"
            />
            <div>
              <p class="text-sm font-bold text-zinc-900">{{ activeConv?.product?.name ?? activeConv?.subject ?? 'Conversation' }}</p>
              <p v-if="activeConv?.product?.price" class="text-xs text-zinc-400">ETB {{ Number(activeConv.product.price).toFixed(2) }}</p>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div v-if="loadingMessages" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            </div>
            <template v-else>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="flex"
                :class="msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm"
                  :class="msg.senderRole === 'customer'
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

          <!-- Input bar -->
          <div class="px-3 py-3 border-t border-zinc-100 shrink-0">
            <div v-if="replyImageUrl" class="mb-2 relative inline-block">
              <img :src="replyImageUrl" class="w-16 h-16 rounded-xl object-cover border border-zinc-200" />
              <button
                class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center text-xs"
                @click="replyImageUrl = null"
              >×</button>
            </div>
            <div class="flex items-end gap-2">
              <input ref="replyFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleReplyImageUpload" />
              <button
                class="shrink-0 p-2 text-zinc-400 hover:text-zinc-700 transition-colors"
                :disabled="replyUploading"
                @click="replyFileInput.click()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <textarea
                v-model="replyBody"
                rows="1"
                maxlength="1000"
                placeholder="Type a message…"
                class="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                @keydown.enter.exact.prevent="sendReply"
              />
              <button
                class="shrink-0 w-9 h-9 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                :disabled="(!replyBody.trim() && !replyImageUrl) || replySending || replyUploading"
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

    <!-- New Conversation Modal -->
    <Teleport to="body">
      <div v-if="newConvOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="newConvOpen = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
          <h2 class="text-base font-bold text-zinc-900">New Conversation</h2>
          <div>
            <label class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Subject / Product name</label>
            <input
              v-model="newSubject"
              type="text"
              maxlength="200"
              placeholder="e.g. Looking for Nutella 400g…"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Message</label>
            <textarea
              v-model="newBody"
              rows="3"
              maxlength="1000"
              placeholder="Your question or request…"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
          <!-- Image -->
          <div v-if="newImageUrl" class="relative inline-block">
            <img :src="newImageUrl" class="w-20 h-20 rounded-xl object-cover border border-zinc-200" />
            <button class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center text-xs" @click="newImageUrl = null">×</button>
          </div>
          <div class="flex items-center gap-2">
            <input ref="newFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleNewImageUpload" />
            <button
              class="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 transition-colors"
              :disabled="newUploading"
              @click="newFileInput.click()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ newUploading ? 'Uploading…' : 'Attach image' }}
            </button>
            <div class="flex-1" />
            <button class="btn-secondary text-sm px-4" @click="newConvOpen = false">Cancel</button>
            <button
              class="btn-primary text-sm px-4"
              :disabled="(!newSubject.trim()) || (!newBody.trim() && !newImageUrl) || newSending || newUploading"
              @click="createConversation"
            >
              {{ newSending ? 'Sending…' : 'Send' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxSrc" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" @click="lightboxSrc = null">
        <img :src="lightboxSrc" class="max-w-full max-h-full rounded-xl object-contain" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'], ssr: false })

const customerStore = useCustomerStore()
const { unreadCount, acknowledge } = useMessageNotifier()

const conversations = ref([])
const loadingList = ref(true)
const activeCid = ref(null)
const activeConv = computed(() => conversations.value.find((c) => c.id === activeCid.value) ?? null)
const messages = ref([])
const loadingMessages = ref(false)
const messagesEl = ref(null)

const replyBody = ref('')
const replyImageUrl = ref(null)
const replyUploading = ref(false)
const replySending = ref(false)
const replyFileInput = ref(null)

const newConvOpen = ref(false)
const newSubject = ref('')
const newBody = ref('')
const newImageUrl = ref(null)
const newUploading = ref(false)
const newSending = ref(false)
const newFileInput = ref(null)

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
    const res = await $fetch('/api/customer/conversations', {
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    conversations.value = res
  } catch { /* silent */ }
  finally { loadingList.value = false }
}

async function openConversation(id) {
  activeCid.value = id
  loadingMessages.value = true
  try {
    const res = await $fetch(`/api/customer/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    messages.value = res
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) conv.unreadCount = 0
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
      const res = await $fetch(`/api/customer/conversations/${activeCid.value}/messages`, {
        headers: { Authorization: `Bearer ${customerStore.token}` },
      })
      const prevLen = messages.value.length
      messages.value = res
      if (res.length > prevLen) {
        await nextTick()
        scrollToBottom()
      }
    } catch { /* silent */ }
  }, 5000)
}

async function handleReplyImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  replyUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/customer/conversations/upload', {
      method: 'POST', body: fd,
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    replyImageUrl.value = res.imageUrl
  } catch (e) { alert(e?.data?.statusMessage ?? 'Upload failed') }
  finally { replyUploading.value = false; event.target.value = '' }
}

async function sendReply() {
  if ((!replyBody.value.trim() && !replyImageUrl.value) || replySending.value) return
  replySending.value = true
  try {
    const msg = await $fetch(`/api/customer/conversations/${activeCid.value}/messages`, {
      method: 'POST',
      body: { body: replyBody.value.trim() || undefined, imageUrl: replyImageUrl.value || undefined },
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    messages.value.push(msg)
    replyBody.value = ''
    replyImageUrl.value = null
    await nextTick()
    scrollToBottom()
    // Update last message in conversation list
    const conv = conversations.value.find((c) => c.id === activeCid.value)
    if (conv) { conv.lastMessage = msg; conv.updatedAt = msg.createdAt }
  } catch (e) { alert(e?.data?.statusMessage ?? 'Failed to send') }
  finally { replySending.value = false }
}

async function handleNewImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  newUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/customer/conversations/upload', {
      method: 'POST', body: fd,
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    newImageUrl.value = res.imageUrl
  } catch (e) { alert(e?.data?.statusMessage ?? 'Upload failed') }
  finally { newUploading.value = false; event.target.value = '' }
}

async function createConversation() {
  if (!newSubject.value.trim() || (!newBody.value.trim() && !newImageUrl.value) || newSending.value) return
  newSending.value = true
  try {
    const res = await $fetch('/api/customer/conversations', {
      method: 'POST',
      body: { subject: newSubject.value.trim(), body: newBody.value.trim() || undefined, imageUrl: newImageUrl.value || undefined },
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    newConvOpen.value = false
    newSubject.value = ''
    newBody.value = ''
    newImageUrl.value = null
    await loadConversations()
    openConversation(res.conversationId)
  } catch (e) { alert(e?.data?.statusMessage ?? 'Failed to create conversation') }
  finally { newSending.value = false }
}

onMounted(async () => {
  acknowledge()
  await loadConversations()
})

onUnmounted(() => clearInterval(pollTimer))

useHead({ title: 'Messages — Jam Store' })
</script>
