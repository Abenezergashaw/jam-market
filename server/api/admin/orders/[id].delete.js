export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, customerName: true } })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })

  await logAudit(payload, event, {
    action: 'ORDER_DELETED',
    entity: 'order',
    entityId: id,
    meta: { customerName: order.customerName },
  })

  return { ok: true }
})
