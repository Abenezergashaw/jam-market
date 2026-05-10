export default defineEventHandler(async (event) => {
  requireCashier(event)

  const query = getQuery(event)
  const search = query.search?.toString().trim() || ''
  const sort = query.sort?.toString() || 'orders'
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = 25

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [total, newThisMonth, customers, activeIds] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        photoUrl: true,
        createdAt: true,
        orders: {
          where: { status: { notIn: ['CANCELLED'] } },
          select: { id: true, totalPrice: true, createdAt: true, status: true },
        },
      },
    }),
    prisma.order.groupBy({
      by: ['customerId'],
      where: { customerId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    }).then(rows => new Set(rows.map(r => r.customerId))),
  ])

  const active = activeIds.size

  // Compute per-customer stats
  const enriched = customers.map(c => {
    const orders = c.orders
    const totalOrders = orders.length
    const totalSpent = orders
      .filter(o => ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalPrice), 0)
    const lastOrderAt = orders.length
      ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
      : null
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      username: c.username,
      phone: c.phone,
      photoUrl: c.photoUrl,
      createdAt: c.createdAt,
      totalOrders,
      totalSpent,
      lastOrderAt,
      isActive: activeIds.has(c.id),
    }
  })

  // Sort
  const sorted = enriched.sort((a, b) => {
    if (sort === 'spent') return b.totalSpent - a.totalSpent
    if (sort === 'new') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sort === 'active') {
      if (!a.lastOrderAt && !b.lastOrderAt) return 0
      if (!a.lastOrderAt) return 1
      if (!b.lastOrderAt) return -1
      return new Date(b.lastOrderAt) - new Date(a.lastOrderAt)
    }
    return b.totalOrders - a.totalOrders
  })

  const paginated = sorted.slice((page - 1) * limit, page * limit)

  return {
    stats: { total, newThisMonth, active },
    customers: paginated,
    total: search ? sorted.length : total,
    page,
    totalPages: Math.ceil((search ? sorted.length : total) / limit),
  }
})
