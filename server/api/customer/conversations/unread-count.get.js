export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)

  const count = await prisma.conversation.count({
    where: {
      customerId: customer.userId,
      messages: {
        some: { senderRole: 'staff', readAt: null },
      },
    },
  })

  return { count }
})
