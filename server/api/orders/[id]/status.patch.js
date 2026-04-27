import { z } from 'zod'
import * as Sentry from '@sentry/nuxt'

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
})

const notificationMessages = {
  CONFIRMED: (id) => `✅ Your Jam Store order #${id} has been confirmed! We're preparing it now.`,
  OUT_FOR_DELIVERY: (id) => `🛵 Your Jam Store order #${id} is on its way! It should arrive soon.`,
  DELIVERED: (id) => `🎉 Your Jam Store order #${id} has been delivered! Thanks for shopping with us.`,
  CANCELLED: (id) => `❌ Your Jam Store order #${id} has been cancelled. Contact us if you have questions.`,
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status value' })
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        customer: { select: { telegramId: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    })

    // Send Telegram notification to customer if they have an account
    const telegramId = order.customer?.telegramId
    const message = notificationMessages[parsed.data.status]
    if (telegramId && message) {
      await sendTelegramMessage(telegramId, message(order.id))
    }

    return {
      ...order,
      totalPrice: order.totalPrice.toString(),
      lat: order.lat?.toString() ?? null,
      lng: order.lng?.toString() ?? null,
      customer: order.customer
        ? { ...order.customer, telegramId: order.customer.telegramId.toString() }
        : null,
      items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
    }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    Sentry.captureException(e, { tags: { component: 'order-status-update' } })
    throw e
  }
})
