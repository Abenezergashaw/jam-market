export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const zones = await prisma.deliveryZone.findMany({ orderBy: { id: 'asc' } })

  return zones.map((z) => ({
    ...z,
    centerLat: z.centerLat.toString(),
    centerLng: z.centerLng.toString(),
    radiusKm: z.radiusKm.toString(),
    minOrderAmount: z.minOrderAmount.toString(),
    deliveryFee: z.deliveryFee.toString(),
  }))
})
