export default defineEventHandler(async (event) => {
  await requireCashier(event, null)

  const productId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const locations = await prisma.productLocation.findMany({
    where: { productId },
    include: { store: { select: { id: true, name: true } } },
  })

  return locations
})
