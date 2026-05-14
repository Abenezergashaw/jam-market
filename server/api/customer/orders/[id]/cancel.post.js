export default defineEventHandler(async (event) => {
  const payload = requireCustomer(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, customerId: true, paymentStatus: true },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  if (order.customerId !== payload.userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (order.status === 'CANCELLED') throw createError({ statusCode: 400, statusMessage: 'Order is already cancelled' })
  if (order.status === 'DELIVERED') throw createError({ statusCode: 400, statusMessage: 'Delivered orders cannot be cancelled' })

  const refundStatus = order.paymentStatus === 'COLLECTED' ? 'PENDING' : 'NONE'

  await prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId: id } })
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }
    await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), refundStatus },
    })
  })

  return { ok: true, refundStatus }
})
