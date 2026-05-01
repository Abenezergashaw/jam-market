export default defineEventHandler(async (event) => {
  const payload = requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))

  try {
    const product = await prisma.product.findUnique({ where: { id }, select: { name: true } })
    await prisma.product.delete({ where: { id } })

    await logAudit(payload, event, {
      action: 'PRODUCT_DELETED',
      entity: 'product',
      entityId: id,
      meta: { name: product?.name ?? null },
    })

    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    if (e.code === 'P2003') throw createError({ statusCode: 409, statusMessage: 'Cannot delete product that has been ordered' })
    throw e
  }
})
