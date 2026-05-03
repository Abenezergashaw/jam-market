export function useAdminMessageNotifier() {
  const unreadCount = useState('admin-messages-unread', () => 0)
  let pollTimer = null

  async function fetchCount() {
    const adminStore = useAdminStore()
    if (!adminStore.token) return null
    try {
      const res = await $fetch('/api/admin/conversations/unread-count', {
        headers: { Authorization: `Bearer ${adminStore.token}` },
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
