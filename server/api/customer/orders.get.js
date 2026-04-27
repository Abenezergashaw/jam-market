export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)

  const orders = await prisma.order.findMany({
    where: { customerId: customer.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
  })

  return orders.map((o) => ({
    ...o,
    totalPrice: o.totalPrice.toString(),
    lat: o.lat?.toString() ?? null,
    lng: o.lng?.toString() ?? null,
    items: o.items.map((i) => ({ ...i, price: i.price.toString() })),
  }))
})
