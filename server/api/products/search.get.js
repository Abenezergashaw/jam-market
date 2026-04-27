export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  const term = String(q ?? '').trim()

  if (term.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Search query must be at least 2 characters' })
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
    },
    orderBy: { name: 'asc' },
    take: 60,
  })

  return products.map(({ costPrice, expiryDate, ...p }) => ({
    ...p,
    price: p.price.toString(),
  }))
})
