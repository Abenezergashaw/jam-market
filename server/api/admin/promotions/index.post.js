import { z } from 'zod'

const schema = z.object({
  name:           z.string().min(1),
  description:    z.string().optional().default(''),
  type:           z.enum(['FREE_DELIVERY', 'PERCENT_OFF', 'FLAT_OFF']),
  value:          z.number().min(0).default(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount:    z.number().min(0).nullable().optional(),
  startAt:        z.string().datetime(),
  endAt:          z.string().datetime(),
  isActive:       z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }
  const { name, description, type, value, minOrderAmount, maxDiscount, startAt, endAt, isActive } = parsed.data
  const promotion = await prisma.promotion.create({
    data: { name, description, type, value, minOrderAmount, maxDiscount: maxDiscount ?? null, startAt: new Date(startAt), endAt: new Date(endAt), isActive },
  })
  return {
    ...promotion,
    value: promotion.value.toString(),
    minOrderAmount: promotion.minOrderAmount.toString(),
    maxDiscount: promotion.maxDiscount?.toString() ?? null,
  }
})
