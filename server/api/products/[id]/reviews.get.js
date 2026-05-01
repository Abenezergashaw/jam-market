import { z } from 'zod'

const querySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(5),
})

export default defineEventHandler(async (event) => {
  const productId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  const { page, limit } = parsed.data

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  let viewer = null
  try { viewer = getCustomerIfLoggedIn(event) } catch {}

  const [reviews, aggregate, grouped] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.productReview.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    }),
  ])

  const total      = aggregate._count.id
  const avgRating  = aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const g of grouped) distribution[g.rating] = g._count.rating

  return {
    summary: { avgRating, count: total, distribution },
    reviews: reviews.map((r) => ({
      id:        r.id,
      rating:    r.rating,
      comment:   r.comment,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      isOwn:     viewer ? viewer.userId === r.customerId : false,
      customer:  {
        id:          r.customer.id,
        displayName: r.customer.firstName + (r.customer.lastName ? ' ' + r.customer.lastName[0] + '.' : ''),
      },
    })),
    page,
    totalPages: Math.ceil(total / limit),
    total,
  }
})
