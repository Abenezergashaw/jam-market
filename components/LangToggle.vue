<template>
  <button
    class="text-xs font-semibold px-2 py-1 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
    @click="toggle"
  >
    {{ locale === 'en' ? 'አማርኛ' : 'EN' }}
  </button>
</template>

<script setup>
const { locale, setLocale } = useLocale()
function toggle() {
  setLocale(locale.value === 'en' ? 'am' : 'en')
}
</script>
