import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const payload = requireCustomer(event)
  const { currentPassword, newPassword } = await readBody(event)

  if (!newPassword || newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'New password must be at least 8 characters' })
  }

  const customer = await prisma.customer.findUnique({
    where: { id: payload.userId },
    select: { id: true, passwordHash: true },
  })

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  // If customer already has a password, require current password to change it
  if (customer.passwordHash) {
    if (!currentPassword) {
      throw createError({ statusCode: 400, statusMessage: 'Current password is required to set a new one' })
    }
    const valid = await bcrypt.compare(currentPassword, customer.passwordHash)
    if (!valid) throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
  }

  await prisma.customer.update({
    where: { id: payload.userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  })

  return { ok: true }
})
