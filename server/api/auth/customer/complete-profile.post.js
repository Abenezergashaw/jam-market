import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const payload = requireCustomer(event)
  const { phone, password } = await readBody(event)

  if (!phone?.trim()) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' })

  const normalizedPhone = normalizePhone(phone.trim())

  const existingByPhone = await prisma.customer.findUnique({ where: { phone: normalizedPhone } })

  // Phone belongs to a different account — merge the OAuth account into it
  if (existingByPhone && existingByPhone.id !== payload.userId) {
    const oauthCustomer = await prisma.customer.findUnique({ where: { id: payload.userId } })

    const mergeData = {}

    // Copy whichever auth identifier the OAuth customer has that the existing account doesn't
    if (oauthCustomer.telegramId && !existingByPhone.telegramId) {
      mergeData.telegramId = oauthCustomer.telegramId
      mergeData.username = oauthCustomer.username || existingByPhone.username
    }
    if (oauthCustomer.googleId && !existingByPhone.googleId) {
      mergeData.googleId = oauthCustomer.googleId
      if (!existingByPhone.email && oauthCustomer.email) mergeData.email = oauthCustomer.email
      if (!existingByPhone.photoUrl && oauthCustomer.photoUrl) mergeData.photoUrl = oauthCustomer.photoUrl
    }

    if (password) {
      if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
      if (!existingByPhone.passwordHash) mergeData.passwordHash = await bcrypt.hash(password, 12)
    }

    const merged = await prisma.customer.update({
      where: { id: existingByPhone.id },
      data: mergeData,
      select: { id: true, firstName: true, lastName: true, phone: true, photoUrl: true, email: true, username: true },
    })

    // Remove the now-duplicate OAuth-created customer (has no orders yet)
    await prisma.customer.delete({ where: { id: payload.userId } }).catch(() => {})

    const newToken = signToken({ userId: merged.id, role: 'customer' })
    return { ...merged, _newToken: newToken }
  }

  // Normal path — phone is free or already belongs to this customer
  const updateData = { phone: normalizedPhone }
  if (password) {
    if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    updateData.passwordHash = await bcrypt.hash(password, 12)
  }

  const customer = await prisma.customer.update({
    where: { id: payload.userId },
    data: updateData,
    select: { id: true, firstName: true, lastName: true, phone: true, photoUrl: true, email: true, username: true },
  })

  return customer
})

function normalizePhone(phone) {
  const digits = phone.replace(/\s+/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return '+251' + digits.slice(1)
  if (digits.startsWith('9') || digits.startsWith('7')) return '+251' + digits
  return '+' + digits
}
