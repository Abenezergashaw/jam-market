function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { from, to } = getQuery(event)

  const toDate = to ? new Date(to) : new Date()
  const fromDate = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  const dateWhere = { createdAt: { gte: fromDate, lte: toDate } }
  const revenueWhere = { ...dateWhere, status: { notIn: ['PENDING', 'CANCELLED'] } }

  const [counts, orders, paymentGroups, topItems] = await Promise.all([
    Promise.all([
      prisma.order.count({ where: dateWhere }),
      prisma.order.count({ where: { ...dateWhere, status: 'PENDING' } }),
      prisma.order.count({ where: { ...dateWhere, status: 'CONFIRMED' } }),
      prisma.order.count({ where: { ...dateWhere, status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { ...dateWhere, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...dateWhere, status: 'CANCELLED' } }),
    ]),
    prisma.order.findMany({
      where: revenueWhere,
      select: {
        totalPrice: true,
        deliveryFee: true,
        createdAt: true,
        storeId: true,
        items: { select: { quantity: true, product: { select: { costPrice: true } } } },
      },
    }),
    prisma.order.groupBy({
      by: ['paymentMethod'],
      where: revenueWhere,
      _count: { id: true },
      _sum: { totalPrice: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: fromDate, lte: toDate },
          status: { notIn: ['PENDING', 'CANCELLED'] },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
  ])

  const [total, pending, confirmed, outForDelivery, delivered, cancelled] = counts

  // Fetch service charge percentages per store
  const storeIds = [...new Set(orders.map((o) => o.storeId).filter(Boolean))]
  const [stores, globalSettings] = await Promise.all([
    storeIds.length
      ? prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, serviceChargePct: true } })
      : [],
    prisma.storeSettings.findFirst({ select: { serviceChargePct: true } }),
  ])
  const storeMap = Object.fromEntries(stores.map((s) => [s.id, Number(s.serviceChargePct ?? 0)]))
  const defaultPct = Number(globalSettings?.serviceChargePct ?? 0)

  // Build day map — all days in range including zero-revenue days
  const dayMap = {}
  const cursor = new Date(fromDate)
  while (cursor <= toDate) {
    const key = ymd(cursor)
    dayMap[key] = { date: key, orders: 0, revenue: 0, deliveryFee: 0, serviceCharge: 0, itemsRevenue: 0, cogs: 0, profit: 0 }
    cursor.setDate(cursor.getDate() + 1)
  }

  let totalRevenue = 0
  let totalDeliveryFee = 0
  let totalServiceCharge = 0
  let totalCogs = 0

  for (const order of orders) {
    const key = ymd(new Date(order.createdAt))
    if (!dayMap[key]) continue
    const rev = Number(order.totalPrice)
    const fee = Number(order.deliveryFee)
    const net = rev - fee
    const pct = order.storeId ? (storeMap[order.storeId] ?? defaultPct) : defaultPct
    const svc = pct > 0 ? net * pct / (100 + pct) : 0
    const itemsRev = net - svc
    const cogs = order.items.reduce(
      (s, i) => s + (i.product?.costPrice ? Number(i.product.costPrice) * i.quantity : 0),
      0,
    )

    dayMap[key].orders++
    dayMap[key].revenue += rev
    dayMap[key].deliveryFee += fee
    dayMap[key].serviceCharge += svc
    dayMap[key].itemsRevenue += itemsRev
    dayMap[key].cogs += cogs
    dayMap[key].profit += itemsRev + svc - cogs

    totalRevenue += rev
    totalDeliveryFee += fee
    totalServiceCharge += svc
    totalCogs += cogs
  }

  const fmt = (n) => parseFloat(n.toFixed(2))
  const revenueByDay = Object.values(dayMap).map((d) => ({
    date: d.date,
    orders: d.orders,
    revenue: fmt(d.revenue),
    deliveryFee: fmt(d.deliveryFee),
    serviceCharge: fmt(d.serviceCharge),
    itemsRevenue: fmt(d.itemsRevenue),
    cogs: fmt(d.cogs),
    profit: fmt(d.profit),
  }))

  // Top products
  const productIds = topItems.map((i) => i.productId)
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, imageUrl: true },
      })
    : []

  const topProducts = topItems.map((item) => {
    const p = products.find((p) => p.id === item.productId)
    return {
      productId: item.productId,
      name: p?.name ?? 'Unknown',
      imageUrl: p?.imageUrl ?? '',
      totalSold: item._sum.quantity ?? 0,
    }
  })

  const totalItemsRevenue = totalRevenue - totalDeliveryFee - totalServiceCharge

  // Payment method breakdown
  const pmMap = {}
  for (const row of paymentGroups) {
    const key = (row.paymentMethod ?? 'CASH').toUpperCase()
    const normalised = (key === 'COD') ? 'CASH' : key
    if (!pmMap[normalised]) pmMap[normalised] = { count: 0, revenue: 0 }
    pmMap[normalised].count += row._count.id
    pmMap[normalised].revenue += Number(row._sum.totalPrice ?? 0)
  }

  const ONLINE_KEYS = ['TELEBIRR', 'CBE', 'BOA']
  const cashEntry = pmMap['CASH'] ?? { count: 0, revenue: 0 }
  const onlineEntry = ONLINE_KEYS.reduce((acc, k) => {
    const e = pmMap[k]
    if (e) { acc.count += e.count; acc.revenue += e.revenue }
    return acc
  }, { count: 0, revenue: 0 })

  const paymentBreakdown = {
    cash: { count: cashEntry.count, revenue: fmt(cashEntry.revenue) },
    online: { count: onlineEntry.count, revenue: fmt(onlineEntry.revenue) },
    byMethod: Object.fromEntries(
      ONLINE_KEYS.map((k) => [k.toLowerCase(), {
        count: pmMap[k]?.count ?? 0,
        revenue: fmt(pmMap[k]?.revenue ?? 0),
      }])
    ),
  }

  return {
    from: ymd(fromDate),
    to: ymd(toDate),
    counts: { total, pending, confirmed, outForDelivery, delivered, cancelled },
    totals: {
      revenue: fmt(totalRevenue),
      deliveryFee: fmt(totalDeliveryFee),
      serviceCharge: fmt(totalServiceCharge),
      itemsRevenue: fmt(totalItemsRevenue),
      cogs: fmt(totalCogs),
      grossProfit: fmt(totalRevenue - totalDeliveryFee - totalCogs),
    },
    revenueByDay,
    topProducts,
    paymentBreakdown,
  }
})
