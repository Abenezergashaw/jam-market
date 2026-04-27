export default defineEventHandler(async (event) => {
  const payload = requireCustomer(event)

  const customer = await prisma.customer.findUnique({
    where: { id: payload.userId },
    select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true, phone: true, createdAt: true },
  })

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  return customer
})
