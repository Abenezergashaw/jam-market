import { z } from 'zod'

const schema = z.object({
  status: z.enum(['DELIVERED']),
})

export default defineEventHandler(async (event) => {
  const p = requireDelivery(event)
  const id = parseInt(getRouterParam(event, 'id'))

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Only DELIVERED status is allowed' })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { deliveryPersonId: true, status: true, customer: { select: { telegramId: true } } },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  if (p.role !== 'admin' && order.deliveryPersonId !== p.userId) {
    throw createError({ statusCode: 403, statusMessage: 'This order is not assigned to you' })
  }

  if (order.status !== 'OUT_FOR_DELIVERY') {
    throw createError({ statusCode: 400, statusMessage: 'Order must be OUT_FOR_DELIVERY to mark as delivered' })
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: 'DELIVERED' },
    select: { id: true, status: true },
  })

  const telegramId = order.customer?.telegramId
  if (telegramId) {
    await sendTelegramMessage(
      telegramId,
      `🎉 Your Jam Store order #${id} has been delivered! Thanks for shopping with us.`
    )
  }

  return updated
})
