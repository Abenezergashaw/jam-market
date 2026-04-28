export default defineEventHandler(async () => {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return stores.map(s => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat?.toString() ?? null,
    lng: s.lng?.toString() ?? null,
    costPerKm: s.costPerKm?.toString() ?? null,
    serviceChargePct: s.serviceChargePct?.toString() ?? null,
  }))
})
