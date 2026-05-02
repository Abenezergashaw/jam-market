export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { from, to } = getQuery(event)
  if (!from || !to) throw createError({ statusCode: 400, statusMessage: 'from and to are required' })

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: new Date(from + 'T00:00:00'),
        lte: new Date(to + 'T23:59:59.999'),
      },
    },
    select: {
      id: true,
      createdAt: true,
      customerName: true,
      totalPrice: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      receiptImageUrl: true,
      paymentReferenceCode: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    orders: orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      customerName: o.customerName,
      totalPrice: o.totalPrice.toString(),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      receiptImageUrl: o.receiptImageUrl ?? null,
      paymentReferenceCode: o.paymentReferenceCode ?? null,
      itemCount: o._count.items,
    })),
  }
})
