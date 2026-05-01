export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { range = '7d' } = getQuery(event)
  const days = range === '30d' ? 30 : 7

  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  // Revenue + COGS orders in parallel
  const [revenueOrders, cogsOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
      select: { totalPrice: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
      select: {
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: { select: { costPrice: true } },
          },
        },
      },
    }),
  ])

  // Build day maps
  const dayMap = {}
  const cogsMap = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    dayMap[key] = 0
    cogsMap[key] = 0
  }

  for (const o of revenueOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (key in dayMap) dayMap[key] += Number(o.totalPrice)
  }

  let totalCogs = 0
  for (const o of cogsOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    const cogs = o.items.reduce((sum, i) => {
      return sum + (i.product?.costPrice ? Number(i.product.costPrice) * i.quantity : 0)
    }, 0)
    if (key in cogsMap) cogsMap[key] += cogs
    totalCogs += cogs
  }

  const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({
    date,
    revenue: parseFloat(revenue.toFixed(2)),
    cogs: parseFloat((cogsMap[date] ?? 0).toFixed(2)),
    profit: parseFloat((revenue - (cogsMap[date] ?? 0)).toFixed(2)),
  }))

  // Top products by quantity sold
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  const productIds = topItems.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, imageUrl: true, price: true },
  })

  const topProducts = topItems.map((item) => {
    const p = products.find((p) => p.id === item.productId)
    return {
      productId: item.productId,
      name: p?.name ?? 'Unknown',
      imageUrl: p?.imageUrl ?? '',
      price: p?.price.toString() ?? '0',
      totalSold: item._sum.quantity ?? 0,
    }
  })

  // Order counts by status
  const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { createdAt: { gte: since }, status: 'PENDING' } }),
    prisma.order.count({ where: { createdAt: { gte: since }, status: 'DELIVERED' } }),
    prisma.order.count({ where: { createdAt: { gte: since }, status: 'CANCELLED' } }),
  ])

  const totalRevenue = revenueByDay.reduce((s, d) => s + d.revenue, 0)

  return {
    range,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCogs: parseFloat(totalCogs.toFixed(2)),
    totalProfit: parseFloat((totalRevenue - totalCogs).toFixed(2)),
    revenueByDay,
    topProducts,
  }
})
