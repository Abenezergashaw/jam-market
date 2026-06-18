import { z } from 'zod'
import { sendPushToAllCustomers } from '~/server/utils/webpush'

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

async function getSettings() {
  const rows = await prisma.$queryRaw`
    SELECT id, min_order_amount, cost_per_km, service_charge_pct,
           estimated_delivery_minutes, store_is_open,
           telebirr_account_number, telebirr_account_name,
           cbe_account_number, cbe_account_name,
           boa_account_number, boa_account_name
    FROM store_settings LIMIT 1
  `
  return rows[0] ?? null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid settings data' })
  }

  const d = parsed.data

  let existing = await getSettings()

  if (!existing) {
    await prisma.$executeRaw`INSERT INTO store_settings DEFAULT VALUES`
    existing = await getSettings()
  }

  const wasClosed = existing.store_is_open === false

  await prisma.$executeRaw`
    UPDATE store_settings SET
      store_is_open              = ${d.storeIsOpen              ?? existing.store_is_open},
      min_order_amount           = ${d.minOrderAmount           ?? Number(existing.min_order_amount)},
      cost_per_km                = ${d.costPerKm                ?? Number(existing.cost_per_km)},
      service_charge_pct         = ${d.serviceChargePct         ?? Number(existing.service_charge_pct)},
      estimated_delivery_minutes = ${d.estimatedDeliveryMinutes ?? existing.estimated_delivery_minutes},
      telebirr_account_number    = ${d.telebirrAccountNumber    ?? existing.telebirr_account_number ?? ''},
      telebirr_account_name      = ${d.telebirrAccountName      ?? existing.telebirr_account_name  ?? ''},
      cbe_account_number         = ${d.cbeAccountNumber         ?? existing.cbe_account_number     ?? ''},
      cbe_account_name           = ${d.cbeAccountName           ?? existing.cbe_account_name       ?? ''},
      boa_account_number         = ${d.boaAccountNumber         ?? existing.boa_account_number     ?? ''},
      boa_account_name           = ${d.boaAccountName           ?? existing.boa_account_name       ?? ''}
    WHERE id = ${existing.id}
  `

  const updated = await getSettings()

  if (wasClosed && updated.store_is_open === true) {
    sendPushToAllCustomers({
      title: '🛒 Jam Supermarket is back!',
      body: 'We are now accepting orders again. Come shop with us!',
      url: '/',
      tag: 'orders-open',
    })
  }

  return {
    minOrderAmount:           updated.min_order_amount.toString(),
    costPerKm:                updated.cost_per_km.toString(),
    serviceChargePct:         updated.service_charge_pct.toString(),
    estimatedDeliveryMinutes: Number(updated.estimated_delivery_minutes),
    storeIsOpen:              updated.store_is_open,
    telebirrAccountNumber:    updated.telebirr_account_number ?? '',
    telebirrAccountName:      updated.telebirr_account_name  ?? '',
    cbeAccountNumber:         updated.cbe_account_number     ?? '',
    cbeAccountName:           updated.cbe_account_name       ?? '',
    boaAccountNumber:         updated.boa_account_number     ?? '',
    boaAccountName:           updated.boa_account_name       ?? '',
  }
})
