export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, null)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, parseInt(query.limit) || 20)
  const skip = (page - 1) * limit

  const where = {}
  if (query.status) where.status = query.status
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus

  // Cashiers only see orders from their assigned store
  if (payload.role === 'cashier' && payload.storeId) {
    where.storeId = payload.storeId
  }

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
      deliveryFee: o.deliveryFee?.toString() ?? '0',
      lat: o.lat?.toString() ?? null,
      lng: o.lng?.toString() ?? null,
      items: o.items.map((i) => ({ ...i, price: i.price.toString() })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
})
