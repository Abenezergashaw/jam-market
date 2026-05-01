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
  const payload = requireStaff(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status value' })
  }

  const newStatus = parsed.data.status

  // Fetch current order for role-based gate checks
  const current = await prisma.order.findUnique({
    where: { id },
    select: { status: true, storeId: true, deliveryPersonId: true },
  })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  if (payload.role === 'cashier') {
    if (current.storeId !== payload.storeId) {
      throw createError({ statusCode: 403, statusMessage: 'This order belongs to a different store' })
    }
    const permMap = {
      CONFIRMED: 'orders:approve',
      CANCELLED: 'orders:cancel',
      OUT_FOR_DELIVERY: 'orders:dispatch',
    }
    const needed = permMap[newStatus]
    if (!needed || !payload.permissions?.includes(needed)) {
      throw createError({ statusCode: 403, statusMessage: 'Permission denied' })
    }
    // Reversions (PENDING, DELIVERED) are admin-only
    if (newStatus === 'DELIVERED' || newStatus === 'PENDING') {
      throw createError({ statusCode: 403, statusMessage: 'Permission denied' })
    }
  }

  if (payload.role === 'delivery') {
    if (newStatus !== 'DELIVERED') {
      throw createError({ statusCode: 403, statusMessage: 'Delivery staff can only mark orders as Delivered' })
    }
    if (current.deliveryPersonId !== payload.userId) {
      throw createError({ statusCode: 403, statusMessage: 'This order is not assigned to you' })
    }
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        customer: {
          select: { id: true, telegramId: true, firstName: true, lastName: true, username: true, photoUrl: true },
        },
        deliveryPerson: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    })

    const telegramId = order.customer?.telegramId
    const message = notificationMessages[newStatus]
    if (telegramId && message) {
      await sendTelegramMessage(telegramId, message(order.id))
    }

    await logAudit(payload, event, {
      action: 'ORDER_STATUS_CHANGED',
      entity: 'order',
      entityId: id,
      meta: { from: current.status, to: newStatus },
    })

    return {
      ...order,
      totalPrice: order.totalPrice.toString(),
      deliveryFee: order.deliveryFee.toString(),
      lat: order.lat?.toString() ?? null,
      lng: order.lng?.toString() ?? null,
      customer: order.customer
        ? { ...order.customer, telegramId: order.customer.telegramId.toString() }
        : null,
      deliveryPerson: order.deliveryPerson ?? null,
      items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
    }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    Sentry.captureException(e, { tags: { component: 'order-status-update' } })
    throw e
  }
})
