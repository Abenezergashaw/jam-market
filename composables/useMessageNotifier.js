export function useMessageNotifier() {
  const unreadCount = useState('customer-messages-unread', () => 0)
  let pollTimer = null

  async function fetchCount() {
    const customerStore = useCustomerStore()
    if (!customerStore.isAuthenticated) return null
    try {
      const res = await $fetch('/api/customer/conversations/unread-count', {
        headers: { Authorization: `Bearer ${customerStore.token}` },
      })
      return res.count ?? 0
    } catch {
      return null
    }
  }

  async function poll() {
    const count = await fetchCount()
    if (count !== null) unreadCount.value = count
  }

  function acknowledge() {
    unreadCount.value = 0
  }

  onMounted(() => {
    poll()
    pollTimer = setInterval(poll, 30000)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  })

  return { unreadCount, acknowledge }
}
