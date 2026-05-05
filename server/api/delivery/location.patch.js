export default defineEventHandler(async (event) => {
  const payload = requireDelivery(event)
  const { lat, lng } = await readBody(event)
  if (typeof lat !== 'number' || typeof lng !== 'number')
    throw createError({ statusCode: 400, statusMessage: 'lat and lng are required numbers' })
  await prisma.user.update({
    where: { id: payload.userId },
    data: { lat, lng, locationUpdatedAt: new Date() },
  })
  return { ok: true }
})
