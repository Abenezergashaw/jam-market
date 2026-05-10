export default defineEventHandler(async (event) => {
  requireCashier(event)

  const count = await prisma.specialOrderRequest.count({
    where: { status: 'PENDING' },
  })

  return { count }
})
