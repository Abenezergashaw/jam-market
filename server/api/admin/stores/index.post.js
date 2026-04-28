import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Store name is required'),
  address: z.string().default(''),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  isActive: z.boolean().default(true),
  costPerKm: z.number().min(0).nullable().optional(),
  serviceChargePct: z.number().min(0).max(100).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }
  const store = await prisma.store.create({ data: parsed.data })
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    lat: store.lat?.toString() ?? null,
    lng: store.lng?.toString() ?? null,
    isActive: store.isActive,
    costPerKm: store.costPerKm?.toString() ?? null,
    serviceChargePct: store.serviceChargePct?.toString() ?? null,
  }
})
