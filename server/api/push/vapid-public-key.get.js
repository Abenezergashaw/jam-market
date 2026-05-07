export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return { key: config.public.vapidPublicKey ?? null }
})
