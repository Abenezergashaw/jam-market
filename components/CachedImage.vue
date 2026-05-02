<template>
  <img :src="displaySrc" v-bind="$attrs" />
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: null },
})

const CACHE_NAME = 'jam-receipts-v1'
const displaySrc = ref(props.src)
let objectUrl = null

onMounted(async () => {
  if (!props.src || !('caches' in window)) return
  try {
    const cache = await caches.open(CACHE_NAME)
    let response = await cache.match(props.src)
    if (!response) {
      const fresh = await fetch(props.src, { mode: 'cors' })
      if (fresh.ok) {
        await cache.put(props.src, fresh.clone())
        response = fresh
      }
    }
    if (response) {
      const blob = await response.blob()
      objectUrl = URL.createObjectURL(blob)
      displaySrc.value = objectUrl
    }
  } catch {
    // Fall back to original src — browser HTTP cache will still help
  }
})

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})
</script>
