export default defineEventHandler(async (event) => {
  requireCashier(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const { status, adminNotes } = await readBody(event)

  const validStatuses = ['PENDING', 'SEEN', 'PROCESSING', 'FULFILLED', 'REJECTED']
  if (status && !validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const existing = await prisma.specialOrderRequest.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Request not found' })

  const updated = await prisma.specialOrderRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes?.trim() || null } : {}),
    },
  })

  return updated
})
