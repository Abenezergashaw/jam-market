import { z } from 'zod'

const schema = z.object({
  minOrderAmount:           z.number().min(0).optional(),
  costPerKm:                z.number().min(0).optional(),
  serviceChargePct:         z.number().min(0).max(100).optional(),
  estimatedDeliveryMinutes: z.number().int().min(1).optional(),
  storeIsOpen:              z.boolean().optional(),
  telebirrAccountNumber:    z.string().max(50).optional(),
  telebirrAccountName:      z.string().max(100).optional(),
  cbeAccountNumber:         z.string().max(50).optional(),
  cbeAccountName:           z.string().max(100).optional(),
  boaAccountNumber:         z.string().max(50).optional(),
  boaAccountName:           z.string().max(100).optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid settings data' })
  }

  let settings = await prisma.storeSettings.findFirst()

  if (!settings) {
    settings = await prisma.storeSettings.create({ data: parsed.data })
  } else {
    settings = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: parsed.data,
    })
  }

  return {
    minOrderAmount:           settings.minOrderAmount.toString(),
    costPerKm:                settings.costPerKm.toString(),
    serviceChargePct:         settings.serviceChargePct.toString(),
    estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
    storeIsOpen:              settings.storeIsOpen,
    telebirrAccountNumber:    settings.telebirrAccountNumber ?? '',
    telebirrAccountName:      settings.telebirrAccountName ?? '',
    cbeAccountNumber:         settings.cbeAccountNumber ?? '',
    cbeAccountName:           settings.cbeAccountName ?? '',
    boaAccountNumber:         settings.boaAccountNumber ?? '',
    boaAccountName:           settings.boaAccountName ?? '',
  }
})
