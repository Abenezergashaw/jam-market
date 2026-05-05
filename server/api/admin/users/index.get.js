export default defineEventHandler(async (event) => {
  const payload = requireStaff(event)

  let where = {}

  if (payload.role === 'cashier') {
    // Cashiers may only look up delivery persons for their own store
    where = { role: 'delivery', storeId: payload.storeId ?? -1 }
  } else if (payload.role === 'admin') {
    const { role, storeId } = getQuery(event)
    if (role) where.role = role
    if (storeId) where.storeId = Number(storeId)
  } else {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true, email: true, role: true, name: true, isActive: true, storeId: true, permissions: true, lat: true, lng: true, locationUpdatedAt: true },
    orderBy: { id: 'asc' },
  })

  return users
})
