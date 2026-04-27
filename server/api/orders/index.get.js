export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, parseInt(query.limit) || 20)
  const skip = (page - 1) * limit

  const where = {}
  if (query.status) where.status = query.status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return {
    data: orders.map((o) => ({
      ...o,
      totalPrice: o.totalPrice.toString(),
      items: o.items.map((i) => ({ ...i, price: i.price.toString() })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
})
