export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  if (id === payload.userId)
    throw createError({ statusCode: 400, statusMessage: 'You cannot deactivate your own account' })

  const { isActive } = await readBody(event)
  if (typeof isActive !== 'boolean')
    throw createError({ statusCode: 400, statusMessage: 'isActive must be a boolean' })

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, email: true, role: true, isActive: true },
  }).catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  })

  await logAudit(payload, event, {
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    entity: 'user',
    entityId: id,
    meta: { email: user.email, role: user.role },
  })

  return user
})
