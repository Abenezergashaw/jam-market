export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map((o) => ({
    ...o,
    totalPrice: o.totalPrice.toString(),
    items: o.items.map((i) => ({ ...i, price: i.price.toString() })),
  }))
})
