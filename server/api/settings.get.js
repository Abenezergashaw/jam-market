export default defineEventHandler(async () => {
  let rows = await prisma.$queryRaw`
    SELECT id, min_order_amount, cost_per_km, service_charge_pct,
           estimated_delivery_minutes, store_is_open,
           telebirr_account_number, telebirr_account_name,
           cbe_account_number, cbe_account_name,
           boa_account_number, boa_account_name
    FROM store_settings LIMIT 1
  `

  if (!rows.length) {
    await prisma.$executeRaw`INSERT INTO store_settings DEFAULT VALUES`
    rows = await prisma.$queryRaw`
      SELECT id, min_order_amount, cost_per_km, service_charge_pct,
             estimated_delivery_minutes, store_is_open,
             telebirr_account_number, telebirr_account_name,
             cbe_account_number, cbe_account_name,
             boa_account_number, boa_account_name
      FROM store_settings LIMIT 1
    `
  }

  const s = rows[0]
  return {
    minOrderAmount: s.min_order_amount.toString(),
    costPerKm: s.cost_per_km.toString(),
    serviceChargePct: s.service_charge_pct.toString(),
    estimatedDeliveryMinutes: Number(s.estimated_delivery_minutes),
    storeIsOpen: s.store_is_open,
    telebirrAccountNumber: s.telebirr_account_number ?? '',
    telebirrAccountName: s.telebirr_account_name ?? '',
    cbeAccountNumber: s.cbe_account_number ?? '',
    cbeAccountName: s.cbe_account_name ?? '',
    boaAccountNumber: s.boa_account_number ?? '',
    boaAccountName: s.boa_account_name ?? '',
  }
})
