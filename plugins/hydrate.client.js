export default defineNuxtPlugin(() => {
  useCartStore().hydrate()
  useAdminStore().hydrate()
  useCustomerOrdersStore().hydrate()
})
