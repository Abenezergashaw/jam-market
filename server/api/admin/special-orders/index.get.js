export default defineEventHandler(async (event) => {
  requireCashier(event)

  const query = getQuery(event)
  const status = query.status || null

  const requests = await prisma.specialOrderRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      productName: true,
      brand: true,
      madeIn: true,
      size: true,
      color: true,
      quantity: true,
      notes: true,
      imageUrl: true,
      status: true,
      adminNotes: true,
      createdAt: true,
      customer: {
        select: { id: true, firstName: true, lastName: true, username: true, phone: true },
      },
    },
  })

  return requests
})
