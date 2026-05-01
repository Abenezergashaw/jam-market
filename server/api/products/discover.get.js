export default defineEventHandler(async () => {
  const [rawFeatured, trendingCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, stock: { gt: 0 } },
      include: { images: { orderBy: { position: 'asc' } } },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isTrending: true },
      take: 6,
    }),
  ])

  return {
    featuredProducts: rawFeatured.map(({ costPrice, expiryDate, ...p }) => ({
      ...p,
      price: p.price.toString(),
    })),
    trendingCategories,
  }
})
