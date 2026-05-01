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

  // Check if the caller is an admin — admins get costPrice, everyone else does not
  let isAdmin = false
  try {
    const p = requireStaff(event)
    isAdmin = p.role === 'admin'
  } catch {}

  const { costPrice, ...pub } = product
  const result = { ...pub, price: pub.price.toString(), expiryDate: pub.expiryDate?.toISOString() ?? null }
  if (isAdmin) result.costPrice = costPrice?.toString() ?? null
  return result
})
