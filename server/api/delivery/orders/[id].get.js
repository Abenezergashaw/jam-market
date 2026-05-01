export default defineEventHandler(async (event) => {
  const p = requireDelivery(event)
  const id = parseInt(getRouterParam(event, 'id'))

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  if (p.role !== 'admin' && order.deliveryPersonId !== p.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    notes: order.notes,
    status: order.status,
    lat: order.lat?.toString() ?? null,
    lng: order.lng?.toString() ?? null,
    createdAt: order.createdAt,
    deliveryPersonId: order.deliveryPersonId,
    items: order.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      product: i.product,
    })),
  }
})
