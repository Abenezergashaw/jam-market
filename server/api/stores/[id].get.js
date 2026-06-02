export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid store ID' })

  const store = await prisma.store.findUnique({
    where: { id },
    select: { id: true, name: true, address: true },
  })

  if (!store) throw createError({ statusCode: 404, statusMessage: 'Store not found' })

  return store
})
