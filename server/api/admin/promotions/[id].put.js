import { z } from 'zod'

const schema = z.object({
  name:           z.string().min(1).optional(),
  description:    z.string().optional(),
  type:           z.enum(['FREE_DELIVERY', 'PERCENT_OFF', 'FLAT_OFF']).optional(),
  value:          z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount:    z.number().min(0).nullable().optional(),
  startAt:        z.string().datetime().optional(),
  endAt:          z.string().datetime().optional(),
  isActive:       z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }
  const data = { ...parsed.data }
  if (data.startAt) data.startAt = new Date(data.startAt)
  if (data.endAt) data.endAt = new Date(data.endAt)
  const promotion = await prisma.promotion.update({ where: { id }, data })
  return {
    ...promotion,
    value: promotion.value.toString(),
    minOrderAmount: promotion.minOrderAmount.toString(),
    maxDiscount: promotion.maxDiscount?.toString() ?? null,
  }
})
