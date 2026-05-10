export default defineEventHandler(async (event) => {
  requireCashier(event)

  const id = parseInt(getRouterParam(event, 'id'))

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      phone: true,
      photoUrl: true,
      createdAt: true,
    },
  })

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  const orders = await prisma.order.findMany({
    where: { customerId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      status: true,
      totalPrice: true,
      createdAt: true,
      address: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { name: true } },
        },
      },
    },
  })

  return { customer, orders }
})
