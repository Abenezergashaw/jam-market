import { z } from 'zod'

const schema = z.object({
  paymentStatus: z.enum(['COLLECTED', 'FAILED']),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment status' })
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus: parsed.data.paymentStatus },
      include: {
        customer: { select: { telegramId: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
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
