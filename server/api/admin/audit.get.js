export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const page  = Math.max(1, parseInt(query.page) || 1)
  const limit = 25
  const skip  = (page - 1) * limit

  const where = {}
  if (query.entity) where.entity = query.entity
  if (query.action) where.action = query.action
  if (query.userId) where.userId = parseInt(query.userId)

  if (query.from || query.to) {
    where.createdAt = {}
    if (query.from) where.createdAt.gte = new Date(query.from)
    if (query.to)   where.createdAt.lte = new Date(query.to + 'T23:59:59.999Z')
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page, totalPages: Math.ceil(total / limit) }
})
