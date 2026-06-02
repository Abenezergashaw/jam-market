export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  if (id === payload.userId)
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (user.role === 'admin')
    throw createError({ statusCode: 400, statusMessage: 'Admin accounts cannot be deleted. Deactivate them instead.' })

  await prisma.user.delete({ where: { id } })

  await logAudit(payload, event, {
    action: 'USER_DELETED',
    entity: 'user',
    entityId: id,
    meta: { email: user.email, role: user.role },
  })

  return { success: true }
})
