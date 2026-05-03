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

  const { body, imageUrl } = await readBody(event)
  if (!body?.trim() && !imageUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Message body or image is required' })
  }
  if (body && body.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Message body too long (max 1000 chars)' })
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: id,
        senderRole: 'customer',
        senderId: customer.userId,
        body: body?.trim() ?? '',
        imageUrl: imageUrl ?? null,
      },
    }),
    prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ])

  return message
})
