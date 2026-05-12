import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const { phone, password, firstName, lastName } = await readBody(event)

  if (!phone?.trim()) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' })
  if (!firstName?.trim()) throw createError({ statusCode: 400, statusMessage: 'First name is required' })
  if (!password || password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })

  const normalizedPhone = normalizePhone(phone.trim())

  const existing = await prisma.customer.findUnique({ where: { phone: normalizedPhone } })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'An account with this phone number already exists' })

  const passwordHash = await bcrypt.hash(password, 12)

  const customer = await prisma.customer.create({
    data: {
      phone: normalizedPhone,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || null,
    },
  })

  const token = signToken({ userId: customer.id, role: 'customer' })

  return {
    token,
    user: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      photoUrl: customer.photoUrl,
      email: customer.email,
    },
  }
})

function normalizePhone(phone) {
  const digits = phone.replace(/\s+/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return '+251' + digits.slice(1)
  if (digits.startsWith('9') || digits.startsWith('7')) return '+251' + digits
  return '+' + digits
}
