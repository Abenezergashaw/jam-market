export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isActive: true },
    orderBy: { id: 'asc' },
  })

  return users
})
