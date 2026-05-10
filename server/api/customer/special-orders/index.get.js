export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)

  const requests = await prisma.specialOrderRequest.findMany({
    where: { customerId: customer.userId },
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
    },
  })

  return requests
})
