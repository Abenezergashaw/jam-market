export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = parseInt(getRouterParam(event, 'id'))
  await prisma.promotion.delete({ where: { id } })
  return { ok: true }
})
