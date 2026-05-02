import { z } from 'zod'

const schema = z.object({
  refundAmount: z.number().positive().optional(),
  refundNote: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'orders:cancel')

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, refundStatus: true, totalPrice: true, storeId: true },
  })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  if (order.status !== 'CANCELLED') throw createError({ statusCode: 400, statusMessage: 'Order must be cancelled to process a refund' })
  if (order.refundStatus !== 'PENDING') throw createError({ statusCode: 400, statusMessage: 'No pending refund for this order' })

  if (payload.role === 'cashier' && payload.storeId && order.storeId !== payload.storeId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const refundAmount = parsed.data.refundAmount ?? Number(order.totalPrice)

  const updated = await prisma.order.update({
    where: { id },
    data: {
      refundStatus: 'REFUNDED',
      refundAmount,
      refundNote: parsed.data.refundNote ?? null,
    },
  })

  await logAudit(payload, event, {
    action: 'ORDER_REFUNDED',
    entity: 'order',
    entityId: id,
    meta: {
      amount: updated.refundAmount?.toString() ?? null,
      note: updated.refundNote ?? null,
    },
  })

  return {
    refundStatus: updated.refundStatus,
    refundAmount: updated.refundAmount?.toString() ?? null,
    refundNote: updated.refundNote,
  }
})
