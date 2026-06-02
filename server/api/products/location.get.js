export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const term = String(query.q ?? '').trim()

  const where = {
    aisle: { not: null },
    ...(term.length >= 2 ? {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
      ],
    } : {}),
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      brand: true,
      imageUrl: true,
      aisle: true,
      shelf: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
  })

  return products
})
