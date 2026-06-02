export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const storeId = parseInt(query.storeId)
  const term = String(query.q ?? '').trim()

  if (isNaN(storeId)) throw createError({ statusCode: 400, statusMessage: 'storeId is required' })

  const locations = await prisma.productLocation.findMany({
    where: {
      storeId,
      aisle: { not: null },
      ...(term.length >= 2 ? {
        product: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } },
          ],
        },
      } : {}),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ product: { category: { name: 'asc' } } }, { product: { name: 'asc' } }],
  })

  return locations.map((l) => ({
    id: l.product.id,
    name: l.product.name,
    brand: l.product.brand,
    imageUrl: l.product.imageUrl,
    category: l.product.category,
    aisle: l.aisle,
    shelf: l.shelf,
  }))
})
