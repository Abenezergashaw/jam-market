export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'asc' } })
  return stores.map(s => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat?.toString() ?? null,
    lng: s.lng?.toString() ?? null,
    isActive: s.isActive,
    costPerKm: s.costPerKm?.toString() ?? null,
    serviceChargePct: s.serviceChargePct?.toString() ?? null,
  }))
})
