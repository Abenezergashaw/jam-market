import { z } from 'zod'

const schema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED']),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Status must be CONFIRMED or CANCELLED' })
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    })
    return {
      ...order,
      totalPrice: order.totalPrice.toString(),
      items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
    }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    throw e
  }
})
