export default defineEventHandler(async () => {
  let settings = await prisma.storeSettings.findFirst()

  if (!settings) {
    settings = await prisma.storeSettings.create({ data: {} })
  }

  return {
    minOrderAmount: settings.minOrderAmount.toString(),
    costPerKm: settings.costPerKm.toString(),
    serviceChargePct: settings.serviceChargePct.toString(),
    storeLat: settings.storeLat?.toString() ?? null,
    storeLng: settings.storeLng?.toString() ?? null,
    estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
    storeIsOpen: settings.storeIsOpen,
  }
})
