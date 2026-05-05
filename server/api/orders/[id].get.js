export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, null)

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
      deliveryPerson: { select: { id: true, name: true, email: true } },
      paymentVerifiedBy: { select: { id: true, name: true, email: true } },
      store: { select: { id: true, lat: true, lng: true } },
    },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  // Cashiers can only view orders from their own store
  if (payload.role === 'cashier' && payload.storeId && order.storeId !== payload.storeId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const result = {
    ...order,
    totalPrice: order.totalPrice.toString(),
    deliveryFee: order.deliveryFee.toString(),
    lat: order.lat?.toString() ?? null,
    lng: order.lng?.toString() ?? null,
    refundAmount: order.refundAmount?.toString() ?? null,
    customer: order.customer
      ? { ...order.customer, telegramId: order.customer.telegramId.toString() }
      : null,
    deliveryPerson: order.deliveryPerson ?? null,
    paymentVerifiedBy: order.paymentVerifiedBy ?? null,
    store: order.store
      ? { ...order.store, lat: order.store.lat?.toString() ?? null, lng: order.store.lng?.toString() ?? null }
      : null,
    items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
  }

  // Strip financial data for cashiers
  if (payload.role === 'cashier') {
    delete result.totalPrice
    delete result.deliveryFee
  }

  return result
})
