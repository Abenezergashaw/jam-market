export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const adminStore = useAdminStore()
  adminStore.hydrate()

  if (!adminStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
