export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const store = useAdminStore()
  store.hydrate()
  if (!store.isAuthenticated) return navigateTo('/admin/login')
  const role = store.user?.role
  if (role !== 'cashier' && role !== 'admin') return navigateTo('/admin/login')
  // Refresh token so permissions are always current from DB
  await store.refreshSession()
})
