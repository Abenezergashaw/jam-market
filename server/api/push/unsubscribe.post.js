export default defineEventHandler(async (event) => {
  let payload
  try {
    payload = requireCustomer(event)
  } catch {
    payload = requireStaff(event)
  }

  const { endpoint } = await readBody(event)
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: 'endpoint required' })

  await prisma.pushSubscription.deleteMany({ where: { endpoint } })

  return { ok: true }
})
