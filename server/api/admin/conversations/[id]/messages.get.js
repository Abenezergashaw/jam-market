export default defineEventHandler(async (event) => {
  requireCashier(event, null)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid conversation ID' })

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      subject: true,
      customer: { select: { id: true, firstName: true, lastName: true, username: true } },
      product: { select: { id: true, name: true, imageUrl: true, price: true } },
    },
  })
  if (!conversation) throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderRole: true, body: true, imageUrl: true, createdAt: true },
  })

  // Mark all unread customer messages as read
  await prisma.message.updateMany({
    where: { conversationId: id, senderRole: 'customer', readAt: null },
    data: { readAt: new Date() },
  })

  return { conversation, messages }
})
