export default defineEventHandler(async () => {
  const now = new Date()
  const promotions = await prisma.promotion.findMany({
    where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
    orderBy: { value: 'desc' },
  })
  return promotions.map((p) => ({
    ...p,
    value: p.value.toString(),
    minOrderAmount: p.minOrderAmount.toString(),
    maxDiscount: p.maxDiscount?.toString() ?? null,
  }))
})
