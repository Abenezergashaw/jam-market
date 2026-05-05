export default defineEventHandler(async (event) => {
  const payload = requireStaff(event)
  if (!payload.storeId) return null
  const store = await prisma.store.findUnique({
    where: { id: payload.storeId },
    select: { id: true, name: true, lat: true, lng: true },
  })
  if (!store) return null
  return {
    id: store.id,
    name: store.name,
    lat: store.lat?.toString() ?? null,
    lng: store.lng?.toString() ?? null,
  }
})
