export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    todayOrderCount,
    todayConfirmed,
    totalProducts,
    totalCategories,
    outOfStockCount,
    lowStockCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({ where: { status: 'CONFIRMED' }, select: { totalPrice: true } }),
    prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.order.findMany({
      where: { status: 'CONFIRMED', createdAt: { gte: today, lt: tomorrow } },
      select: { totalPrice: true },
    }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.count({ where: { stock: { gt: 0, lt: 10 } } }),
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      include: { category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 8,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
    }),
  ])

  const revenue = confirmedOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0)
  const todayRevenue = todayConfirmed.reduce((sum, o) => sum + Number(o.totalPrice), 0)

  return {
    totalOrders,
    pendingOrders,
    revenue,
    todayOrders: todayOrderCount,
    todayRevenue,
    totalProducts,
    totalCategories,
    outOfStockCount,
    lowStockCount,
    lowStockProducts: lowStockProducts.map((p) => ({ ...p, price: p.price.toString() })),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalPrice: o.totalPrice.toString(),
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    })),
  }
})
