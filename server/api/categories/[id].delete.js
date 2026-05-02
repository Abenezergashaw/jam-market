export default defineEventHandler(async (event) => {
  const payload = requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))

  const category = await prisma.category.findUnique({ where: { id }, select: { name: true } })

  try {
    await prisma.category.delete({ where: { id } })

    await logAudit(payload, event, {
      action: 'CATEGORY_DELETED',
      entity: 'category',
      entityId: id,
      meta: { name: category?.name ?? null },
    })

    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    throw e
  }
})
