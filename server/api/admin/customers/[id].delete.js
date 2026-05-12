export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })

  const customer = await prisma.customer.findUnique({ where: { id }, select: { id: true } })
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  await prisma.customer.delete({ where: { id } })

  return { ok: true }
})
