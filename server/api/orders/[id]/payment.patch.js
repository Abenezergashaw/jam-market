import { z } from 'zod'

const schema = z.object({
  paymentStatus: z.enum(['COLLECTED', 'FAILED']),
  note: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
  const staff = requireCashier(event, null)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment status' })
  }

  // Fetch current order for validation and auto-cancel logic
  const current = await prisma.order.findUnique({
    where: { id },
    select: {
      storeId: true,
      status: true,
      items: { select: { productId: true, quantity: true } },
    },
  })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  if (staff.role === 'cashier' && staff.storeId && current.storeId !== staff.storeId) {
    throw createError({ statusCode: 403, statusMessage: 'This order belongs to a different store' })
  }

  const baseData = {
    paymentStatus: parsed.data.paymentStatus,
    paymentNote: parsed.data.note ?? null,
    paymentVerifiedAt: new Date(),
    paymentVerifiedById: staff.userId,
  }

  const orderInclude = {
    customer: { select: { telegramId: true } },
    paymentVerifiedBy: { select: { id: true, name: true, email: true } },
    items: { include: { product: { select: { id: true, name: true } } } },
  }

  try {
    let order

    const shouldAutoCancel =
      parsed.data.paymentStatus === 'FAILED' &&
      !['CANCELLED', 'DELIVERED'].includes(current.status)

    if (shouldAutoCancel) {
      const cancelReason = parsed.data.note?.trim() || 'Payment verification failed'
      order = await prisma.$transaction(async (tx) => {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
        return tx.order.update({
          where: { id },
          data: {
            ...baseData,
            status: 'CANCELLED',
            cancelReason,
            cancelledAt: new Date(),
            refundStatus: 'NONE',
          },
          include: orderInclude,
        })
      })
    } else {
      order = await prisma.order.update({
        where: { id },
        data: baseData,
        include: orderInclude,
      })
    }

    await logAudit(staff, event, {
      action: 'PAYMENT_VERIFIED',
      entity: 'order',
      entityId: id,
      meta: {
        paymentStatus: parsed.data.paymentStatus,
        note: parsed.data.note ?? null,
        autoCancelled: shouldAutoCancel,
      },
    })

    if (parsed.data.paymentStatus === 'COLLECTED') {
      sendPushToCustomer(order.customerId, {
        title: '✅ Payment Confirmed',
        body: `Your payment for order #${id} has been verified. We're preparing your order.`,
        url: '/orders',
        tag: `payment-confirmed-${id}`,
      })
    }

    if (parsed.data.paymentStatus === 'FAILED') {
      const note = parsed.data.note?.trim()

      if (order.customer?.telegramId) {
        const reasonLine = note ? `\n\n<b>Reason:</b> ${note}` : ''
        await sendTelegramMessage(
          order.customer.telegramId,
          `❌ Your payment for <b>Jam Store order #${id}</b> has been declined and your order has been automatically cancelled.${reasonLine}\n\nPlease contact us if you need assistance.`,
        )
      }

      sendPushToCustomer(order.customerId, {
        title: '❌ Payment Failed',
        body: note
          ? `Order #${id} payment declined: ${note}. Order cancelled.`
          : `Your payment for order #${id} was declined and the order has been cancelled.`,
        url: '/orders',
        tag: `payment-failed-${id}`,
      })
    }

    return {
      ...order,
      totalPrice: order.totalPrice.toString(),
      deliveryFee: order.deliveryFee?.toString() ?? '0',
      lat: order.lat?.toString() ?? null,
      lng: order.lng?.toString() ?? null,
      refundAmount: order.refundAmount?.toString() ?? null,
      customer: order.customer
        ? { ...order.customer, telegramId: order.customer.telegramId?.toString() ?? null }
        : null,
      items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
    }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    throw e
  }
})
