export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid store ID' })

  await prisma.store.delete({ where: { id } }).catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'Store not found' })
  })

  return { ok: true }
})
