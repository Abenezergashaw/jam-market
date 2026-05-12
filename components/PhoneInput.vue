<template>
  <div class="flex">
    <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-100 text-zinc-500 text-sm font-medium select-none shrink-0">
      +251
    </span>
    <input
      :value="digits"
      type="tel"
      inputmode="numeric"
      maxlength="9"
      placeholder="9XXXXXXXX"
      class="input rounded-l-none flex-1 min-w-0"
      v-bind="$attrs"
      @input="onInput"
      @keydown="onKeydown"
    />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const digits = computed(() => {
  const v = props.modelValue ?? ''
  // Strip +251 prefix if present, keep only digits
  return v.replace(/^\+251/, '').replace(/\D/g, '').slice(0, 9)
})

function onInput(e) {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
  e.target.value = raw
  emit('update:modelValue', raw ? '+251' + raw : '')
}

function onKeydown(e) {
  // Allow: backspace, delete, tab, arrows, digits
  if (
    ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
    /^\d$/.test(e.key)
  ) return
  e.preventDefault()
}
</script>
