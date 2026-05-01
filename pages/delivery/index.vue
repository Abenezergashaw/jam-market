<script setup>
definePageMeta({ middleware: ['delivery'], ssr: false })
await navigateTo('/delivery/orders', { replace: true })
</script>
