export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const store = useAdminStore()
  store.hydrate()
  if (!store.isAuthenticated) return navigateTo('/admin/login')
  const role = store.user?.role
  if (role !== 'delivery' && role !== 'admin') return navigateTo('/admin/login')
  await store.refreshSession()
})
