const serialize = (s) => ({ id: s.id, name: s.name, lat: s.lat?.toString() ?? null, lng: s.lng?.toString() ?? null })

export default defineEventHandler(async (event) => {
  const payload = requireStaff(event)

  if (!payload.storeId) {
    // Admin with no assigned store — return all active stores
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true, lat: true, lng: true },
      orderBy: { id: 'asc' },
    })
    return stores.map(serialize)
  }

  const store = await prisma.store.findUnique({
    where: { id: payload.storeId },
    select: { id: true, name: true, lat: true, lng: true },
  })
  return store ? [serialize(store)] : []
})
