export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = query.status ? String(query.status) : undefined
  const storeId = query.storeId ? parseInt(query.storeId) : undefined
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { status } : {}),
    ...(storeId ? { storeId } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.storeFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        store: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.storeFeedback.count({ where }),
  ])

  return { items, total, page }
})
