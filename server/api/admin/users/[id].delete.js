export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'User not found' })
    throw e
  }
})
