export default defineEventHandler(async (event) => {
  requireCashier(event, null)

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      subject: true,
      updatedAt: true,
      customer: { select: { id: true, firstName: true, lastName: true, username: true } },
      product: { select: { id: true, name: true, imageUrl: true, price: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, imageUrl: true, createdAt: true, senderRole: true },
      },
      _count: {
        select: {
          messages: {
            where: { senderRole: 'customer', readAt: null },
          },
        },
      },
    },
  })

  return conversations.map((c) => ({
    id: c.id,
    subject: c.subject,
    updatedAt: c.updatedAt,
    customer: c.customer,
    product: c.product,
    lastMessage: c.messages[0] ?? null,
    unreadCount: c._count.messages,
  }))
})
