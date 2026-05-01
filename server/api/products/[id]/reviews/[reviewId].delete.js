export default defineEventHandler(async (event) => {
  const customer  = requireCustomer(event)
  const productId = parseInt(getRouterParam(event, 'id'))
  const reviewId  = parseInt(getRouterParam(event, 'reviewId'))
  if (isNaN(productId) || isNaN(reviewId)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
    select: { id: true, customerId: true, productId: true },
  })

  if (!review || review.productId !== productId) throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  if (review.customerId !== customer.userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  await prisma.productReview.delete({ where: { id: reviewId } })
  return { success: true }
})
