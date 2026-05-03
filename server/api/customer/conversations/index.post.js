export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  const { productId, subject, body, imageUrl } = await readBody(event)

  if (!productId && !subject?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Provide a productId or subject' })
  }
  if (!body?.trim() && !imageUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Message body or image is required' })
  }
  if (body && body.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Message body too long (max 1000 chars)' })
  }

  let resolvedSubject = subject?.trim() ?? null

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { name: true },
    })
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    resolvedSubject = resolvedSubject ?? product.name
  }

  const result = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        customerId: customer.userId,
        productId: productId ? parseInt(productId) : null,
        subject: resolvedSubject,
      },
    })
    const message = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderRole: 'customer',
        senderId: customer.userId,
        body: body?.trim() ?? '',
        imageUrl: imageUrl ?? null,
      },
    })
    return { conversationId: conversation.id, message }
  })

  return result
})
