import { z } from 'zod'

const bodySchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
})

export default defineEventHandler(async (event) => {
  const customer  = requireCustomer(event)
  const productId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })

  const body   = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  const { rating, comment } = parsed.data

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const review = await prisma.productReview.upsert({
    where: { productId_customerId: { productId, customerId: customer.userId } },
    create: { productId, customerId: customer.userId, rating, comment: comment ?? null },
    update: { rating, comment: comment ?? null },
  })

  return {
    id:        review.id,
    rating:    review.rating,
    comment:   review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }
})
