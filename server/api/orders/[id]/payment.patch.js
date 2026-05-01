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

  // Cashiers can only update orders from their assigned store
  if (staff.role === 'cashier' && staff.storeId) {
    const existing = await prisma.order.findUnique({ where: { id }, select: { storeId: true } })
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (existing.storeId !== staff.storeId) {
      throw createError({ statusCode: 403, statusMessage: 'This order belongs to a different store' })
    }
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: parsed.data.paymentStatus,
        paymentNote: parsed.data.note ?? null,
        paymentVerifiedAt: new Date(),
        paymentVerifiedById: staff.userId,
      },
      include: {
        customer: { select: { telegramId: true } },
        paymentVerifiedBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    })

    await logAudit(staff, event, {
      action: 'PAYMENT_VERIFIED',
      entity: 'order',
      entityId: id,
      meta: { paymentStatus: parsed.data.paymentStatus, note: parsed.data.note ?? null },
    })

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
    throw e
  }
})
