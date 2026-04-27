export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where = {}
  if (query.category_id) where.categoryId = parseInt(query.category_id)
  if (query.featured === 'true') where.isFeatured = true

  // Featured products (homepage carousel) — flat array, capped at 12
  if (query.featured === 'true') {
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: 'asc' } },
      },
      orderBy: { name: 'asc' },
      take: 12,
    })
    return products.map(({ costPrice, expiryDate, ...p }) => ({
      ...p,
      price: p.price.toString(),
    }))
  }

  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, parseInt(query.limit) || 20)
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: 'asc' } },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products.map(({ costPrice, expiryDate, ...p }) => ({
      ...p,
      price: p.price.toString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
})
