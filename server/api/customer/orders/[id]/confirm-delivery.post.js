export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const order = await prisma.order.findUnique({
    where: { id },
    select: { customerId: true, status: true },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  // Security: only the customer who placed this order can confirm receipt
  if (order.customerId !== customer.userId) {
    throw createError({ statusCode: 403, statusMessage: 'This order does not belong to you' })
  }

  // Idempotent: already confirmed
  if (order.status === 'DELIVERED') {
    return { status: 'DELIVERED' }
  }

  // Only allow confirmation once the order is actually out for delivery
  if (order.status !== 'OUT_FOR_DELIVERY') {
    throw createError({
      statusCode: 400,
      statusMessage: 'This order is not yet out for delivery and cannot be confirmed',
    })
  }

  await prisma.order.update({
    where: { id },
    data: { status: 'DELIVERED' },
  })

  await logAudit({ userId: customer.userId, role: 'customer' }, event, {
    action: 'ORDER_STATUS_CHANGED',
    entity: 'order',
    entityId: id,
    meta: { from: 'OUT_FOR_DELIVERY', to: 'DELIVERED', confirmedByCustomer: true },
  })

  return { status: 'DELIVERED' }
})
