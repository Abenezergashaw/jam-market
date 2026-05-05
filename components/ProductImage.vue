<template>
  <img v-if="src && !errored" v-bind="$attrs" :src="src" :alt="alt" @error="errored = true" />
  <div v-else v-bind="$attrs" class="bg-zinc-100 flex items-center justify-center shrink-0">
    <span class="text-[9px] font-bold text-zinc-400 tracking-widest select-none uppercase">NA</span>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
})

const errored = ref(false)
watch(() => props.src, () => { errored.value = false })
</script>
