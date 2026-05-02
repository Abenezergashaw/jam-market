export function useOrderNotifier() {
  const pendingCount = useState('admin-pending-count', () => 0)

  let pollTimer = null
  let knownIds = null

  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const beeps = [880, 1100, 880, 1100, 880, 1100]
      const beepDuration = 0.55
      const gap = 0.28
      beeps.forEach((freq, i) => {
        const start = ctx.currentTime + i * (beepDuration + gap)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.25, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + beepDuration)
        osc.start(start)
        osc.stop(start + beepDuration)
      })
      setTimeout(() => ctx.close(), beeps.length * (beepDuration + gap) * 1000 + 500)
    } catch { /* browser may block autoplay */ }
  }

  async function fetchPendingIds() {
    const adminStore = useAdminStore()
    if (!adminStore.token) return null
    try {
      const res = await $fetch('/api/orders?status=PENDING&limit=100', {
        headers: { Authorization: `Bearer ${adminStore.token}` },
      })
      return new Set((res.data ?? []).map((o) => o.id))
    } catch {
      return null
    }
  }

  async function poll() {
    const ids = await fetchPendingIds()
    if (!ids) return

    if (knownIds === null) {
      // Baseline — no alarm, no badge for pre-existing orders
      knownIds = ids
    } else {
      const newOnes = [...ids].filter((id) => !knownIds.has(id))
      if (newOnes.length > 0) {
        pendingCount.value += newOnes.length
        playAlarm()
      }
      knownIds = ids
    }
  }

  // Called when admin navigates to the orders page — clears the badge
  // and refreshes the known-IDs baseline so no re-alarm for visible orders
  async function acknowledge() {
    pendingCount.value = 0
    const ids = await fetchPendingIds()
    if (ids) knownIds = ids
  }

  onMounted(() => {
    poll()
    pollTimer = setInterval(poll, 30000)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  })

  return { pendingCount, acknowledge }
}
