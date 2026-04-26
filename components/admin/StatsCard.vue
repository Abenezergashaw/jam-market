<template>
  <div class="card p-5">
    <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{{ label }}</p>
    <p class="text-2xl font-bold text-zinc-900 mt-2">{{ value }}</p>
    <p v-if="sub" class="text-xs text-zinc-400 mt-1">{{ sub }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  sub: String,
})
</script>
