export default defineEventHandler(async (event) => {
  const p = requireStaff(event)

  const user = await prisma.user.findUnique({
    where: { id: p.userId },
    select: { id: true, email: true, role: true, name: true, isActive: true, storeId: true, permissions: true },
  })

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Account disabled or not found' })
  }

  // Re-issue a fresh token so the client always has up-to-date permissions
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    storeId: user.storeId ?? null,
    permissions: user.permissions ?? [],
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      storeId: user.storeId ?? null,
      permissions: user.permissions ?? [],
    },
  }
})
