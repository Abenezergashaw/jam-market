export const useAdminFetch = () => {
  const adminStore = useAdminStore()

  const adminFetch = (url, options = {}) => {
    return $fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${adminStore.token}`,
      },
    })
  }

  return { adminFetch }
}
