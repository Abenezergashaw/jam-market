export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id'))

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
    },
  })

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  return { ...product, price: product.price.toString() }
})
