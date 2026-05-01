export default defineEventHandler(async (event) => {
  const payload = requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))

  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } })
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    await logAudit(payload, event, {
      action: 'USER_DEACTIVATED',
      entity: 'user',
      entityId: id,
      meta: { email: user?.email ?? null, role: user?.role ?? null },
    })

    return { success: true }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'User not found' })
    throw e
  }
})
