export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const customerStore = useCustomerStore()
  customerStore.hydrate()

  if (!customerStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
