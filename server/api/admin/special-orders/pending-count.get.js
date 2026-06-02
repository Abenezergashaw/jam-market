export default defineEventHandler(async (event) => {
  await requireCashier(event)

  const count = await prisma.specialOrderRequest.count({
    where: { status: 'PENDING' },
  })

  return { count }
})
