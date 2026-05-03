export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)

  const conversations = await prisma.conversation.findMany({
    where: { customerId: customer.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      subject: true,
      updatedAt: true,
      product: { select: { id: true, name: true, imageUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, imageUrl: true, createdAt: true, senderRole: true },
      },
      _count: {
        select: {
          messages: {
            where: { senderRole: 'staff', readAt: null },
          },
        },
      },
    },
  })

  return conversations.map((c) => ({
    id: c.id,
    subject: c.subject,
    updatedAt: c.updatedAt,
    product: c.product,
    lastMessage: c.messages[0] ?? null,
    unreadCount: c._count.messages,
  }))
})
