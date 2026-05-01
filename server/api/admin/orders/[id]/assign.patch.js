import { z } from 'zod'

const schema = z.object({
  deliveryPersonId: z.number().int().positive().nullable(),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'orders:dispatch')

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid delivery person ID' })
  }

  if (payload.role === 'cashier') {
    // Verify order belongs to cashier's store
    const order = await prisma.order.findUnique({ where: { id }, select: { storeId: true } })
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (order.storeId !== payload.storeId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    // Verify delivery person belongs to cashier's store
    if (parsed.data.deliveryPersonId !== null) {
      const dp = await prisma.user.findUnique({ where: { id: parsed.data.deliveryPersonId }, select: { storeId: true, role: true } })
      if (!dp || dp.role !== 'delivery' || dp.storeId !== payload.storeId) {
        throw createError({ statusCode: 403, statusMessage: 'Delivery person not in your store' })
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { deliveryPersonId: parsed.data.deliveryPersonId },
    select: { id: true, deliveryPersonId: true, status: true },
  }).catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  })

  await logAudit(payload, event, {
    action: 'DELIVERY_ASSIGNED',
    entity: 'order',
    entityId: id,
    meta: { deliveryPersonId: parsed.data.deliveryPersonId },
  })

  return updated
})
