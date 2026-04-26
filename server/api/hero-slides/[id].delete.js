export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  try {
    await prisma.heroSlide.delete({ where: { id } })
    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Slide not found' })
    throw e
  }
})
