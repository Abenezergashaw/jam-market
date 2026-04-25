export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const [totalOrders, pendingOrders, confirmedOrders, lowStockProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      where: { status: 'CONFIRMED' },
      select: { totalPrice: true },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      include: { category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
    }),
  ])

  const revenue = confirmedOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0)

  return {
    totalOrders,
    pendingOrders,
    revenue,
    lowStockProducts: lowStockProducts.map((p) => ({ ...p, price: p.price.toString() })),
  }
})
