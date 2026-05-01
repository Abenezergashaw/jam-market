<template>
  <div class="flex items-center gap-0.5" :class="{ 'cursor-pointer select-none': !readonly }">
    <template v-for="i in 5" :key="i">
      <button
        v-if="!readonly"
        type="button"
        class="transition-transform active:scale-90 hover:scale-110 focus:outline-none"
        :class="sizeClass"
        @mouseenter="hovered = i"
        @mouseleave="hovered = 0"
        @click="$emit('update:modelValue', i)"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 9.27l6.91-1.01L12 2z"
            :fill="i <= activeValue ? '#629e3a' : 'none'"
            :stroke="i <= activeValue ? '#629e3a' : '#d4d4d8'"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Readonly: support half-stars with clip overlay -->
      <span v-else :class="['relative inline-block', sizeClass]">
        <!-- Empty base star -->
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 9.27l6.91-1.01L12 2z"
            fill="none" stroke="#d4d4d8" stroke-width="1.5" stroke-linejoin="round"
          />
        </svg>
        <!-- Filled overlay clipped by fill fraction -->
        <span
          class="absolute inset-0 overflow-hidden"
          :style="{ width: fillPct(i) + '%' }"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 9.27l6.91-1.01L12 2z"
              fill="#629e3a" stroke="#629e3a" stroke-width="1.5" stroke-linejoin="round"
            />
          </svg>
        </span>
      </span>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly:   { type: Boolean, default: false },
  size:       { type: String,  default: 'md' },
})
defineEmits(['update:modelValue'])

const hovered = ref(0)

const activeValue = computed(() => hovered.value || props.modelValue)

const sizeClass = computed(() => ({
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}[props.size] ?? 'w-5 h-5'))

function fillPct(i) {
  const val = props.modelValue
  if (i <= Math.floor(val)) return 100
  if (i - 1 < val && val < i) return Math.round((val - (i - 1)) * 100)
  return 0
}
</script>
