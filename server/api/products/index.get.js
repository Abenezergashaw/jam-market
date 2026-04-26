export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where = {}
  if (query.category_id) where.categoryId = parseInt(query.category_id)
  if (query.featured === 'true') where.isFeatured = true

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })

  return products.map(({ costPrice, expiryDate, ...p }) => ({
    ...p,
    price: p.price.toString(),
  }))
})
