export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const promotions = await prisma.promotion.findMany({
    orderBy: { startAt: 'desc' },
  })
  return promotions.map((p) => ({
    ...p,
    value: p.value.toString(),
    minOrderAmount: p.minOrderAmount.toString(),
    maxDiscount: p.maxDiscount?.toString() ?? null,
  }))
})
