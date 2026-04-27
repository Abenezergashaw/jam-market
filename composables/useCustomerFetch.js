export function useCustomerFetch() {
  const customerStore = useCustomerStore()

  const customerFetch = (url, options = {}) => {
    return $fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${customerStore.token}`,
      },
    })
  }

  return { customerFetch }
}
