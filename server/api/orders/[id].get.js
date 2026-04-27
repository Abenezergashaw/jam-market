export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      customer: {
        select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true, telegramId: true },
      },
    },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  return {
    ...order,
    totalPrice: order.totalPrice.toString(),
    lat: order.lat?.toString() ?? null,
    lng: order.lng?.toString() ?? null,
    customer: order.customer
      ? { ...order.customer, telegramId: order.customer.telegramId.toString() }
      : null,
    items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
  }
})
