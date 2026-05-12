import { z } from 'zod'
import * as Sentry from '@sentry/nuxt'

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  cancelReason: z.string().max(300).optional(),
})

const notificationMessages = {
  CONFIRMED: (id) => `✅ Your Jam Store order #${id} has been confirmed! We're preparing it now.`,
  OUT_FOR_DELIVERY: (id) => `🛵 Your Jam Store order #${id} is on its way! It should arrive soon.`,
  DELIVERED: (id) => `🎉 Your Jam Store order #${id} has been delivered! Thanks for shopping with us.`,
}

export default defineEventHandler(async (event) => {
  const payload = requireStaff(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status value' })
  }

  const { status: newStatus, cancelReason } = parsed.data

  const current = await prisma.order.findUnique({
    where: { id },
    select: { status: true, storeId: true, deliveryPersonId: true, paymentStatus: true },
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

  const include = {
    customer: {
      select: { id: true, telegramId: true, firstName: true, lastName: true, username: true, photoUrl: true },
    },
    deliveryPerson: { select: { id: true, name: true, email: true } },
    items: {
      include: { product: { select: { id: true, name: true, imageUrl: true } } },
    },
  }

  try {
    let order

    if (newStatus === 'CANCELLED') {
      const refundStatus = current.paymentStatus === 'COLLECTED' ? 'PENDING' : 'NONE'

      order = await prisma.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({ where: { orderId: id } })
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }

        return tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelReason: cancelReason ?? null,
            cancelledAt: new Date(),
            refundStatus,
          },
          include,
        })
      })

      await logAudit(payload, event, {
        action: 'ORDER_CANCELLED',
        entity: 'order',
        entityId: id,
        meta: { from: current.status, reason: cancelReason ?? null, refundStatus },
      })
    } else {
      order = await prisma.order.update({
        where: { id },
        data: { status: newStatus },
        include,
      })

      await logAudit(payload, event, {
        action: 'ORDER_STATUS_CHANGED',
        entity: 'order',
        entityId: id,
        meta: { from: current.status, to: newStatus },
      })
    }

    const telegramId = order.customer?.telegramId
    if (telegramId) {
      let message
      if (newStatus === 'CANCELLED') {
        const reasonLine = cancelReason?.trim() ? `\n\n<b>Reason:</b> ${cancelReason.trim()}` : ''
        message = `❌ Your Jam Store order #${order.id} has been cancelled.${reasonLine}\n\nContact us if you have questions.`
      } else {
        message = notificationMessages[newStatus]?.(order.id)
      }
      if (message) await sendTelegramMessage(telegramId, message)
    }

    // Web push — fire-and-forget
    const pushTitles = {
      CONFIRMED: '✅ Order Confirmed',
      OUT_FOR_DELIVERY: '🛵 On the Way',
      DELIVERED: '🎉 Order Delivered',
      CANCELLED: '❌ Order Cancelled',
    }
    const pushBodies = {
      CONFIRMED: `Your order #${order.id} is being prepared.`,
      OUT_FOR_DELIVERY: `Your order #${order.id} is out for delivery.`,
      DELIVERED: `Your order #${order.id} has been delivered!`,
      CANCELLED: cancelReason?.trim()
        ? `Your order #${order.id} was cancelled: ${cancelReason.trim()}`
        : `Your order #${order.id} was cancelled.`,
    }
    if (pushTitles[newStatus]) {
      sendPushToCustomer(order.customerId, {
        title: pushTitles[newStatus],
        body: pushBodies[newStatus],
        url: '/orders',
        tag: `order-${order.id}`,
      })
    }
    if (newStatus === 'OUT_FOR_DELIVERY' && order.deliveryPersonId) {
      sendPushToUser(order.deliveryPersonId, {
        title: '📦 New Delivery Assignment',
        body: `Order #${order.id} has been assigned to you.`,
        url: '/delivery/orders',
        tag: `assign-${order.id}`,
      })
    }

    return {
      ...order,
      totalPrice: order.totalPrice.toString(),
      deliveryFee: order.deliveryFee.toString(),
      lat: order.lat?.toString() ?? null,
      lng: order.lng?.toString() ?? null,
      refundAmount: order.refundAmount?.toString() ?? null,
      customer: order.customer
        ? { ...order.customer, telegramId: order.customer.telegramId?.toString() ?? null }
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
