export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid conversation ID' })

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { customerId: true },
  })
  if (!conversation) throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  if (conversation.customerId !== customer.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderRole: true, body: true, imageUrl: true, createdAt: true },
  })

  // Mark all unread staff messages as read
  await prisma.message.updateMany({
    where: { conversationId: id, senderRole: 'staff', readAt: null },
    data: { readAt: new Date() },
  })

  return messages
})
