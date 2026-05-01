export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id'))

  const [product, reviewStats] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: 'asc' } },
      },
    }),
    prisma.productReview.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ])

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  // Check if the caller is an admin — admins get costPrice, everyone else does not
  let isAdmin = false
  try {
    const p = requireStaff(event)
    isAdmin = p.role === 'admin'
  } catch {}

  const { costPrice, ...pub } = product
  const result = { ...pub, price: pub.price.toString(), expiryDate: pub.expiryDate?.toISOString() ?? null }
  if (isAdmin) result.costPrice = costPrice?.toString() ?? null
  result.avgRating   = reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : null
  result.reviewCount = reviewStats._count.id
  return result
})
