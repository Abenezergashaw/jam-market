export default defineEventHandler(async (event) => {
  const payload = requireDelivery(event)
  if (!payload.storeId) return null
  const store = await prisma.store.findUnique({
    where: { id: payload.storeId },
    select: { id: true, name: true },
  })
  return store
})
