export default defineEventHandler(async () => {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  })

  return zones.map((z) => ({
    ...z,
    centerLat: z.centerLat.toString(),
    centerLng: z.centerLng.toString(),
    radiusKm: z.radiusKm.toString(),
    minOrderAmount: z.minOrderAmount.toString(),
    deliveryFee: z.deliveryFee.toString(),
  }))
})
