export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))

  try {
    await prisma.product.delete({ where: { id } })
    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    if (e.code === 'P2003') throw createError({ statusCode: 409, statusMessage: 'Cannot delete product that has been ordered' })
    throw e
  }
})
