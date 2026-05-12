import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const payload = requireCustomer(event)
  const { phone, password } = await readBody(event)

  if (!phone?.trim()) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' })

  const normalizedPhone = normalizePhone(phone.trim())

  // Check phone not taken by another customer
  const existing = await prisma.customer.findUnique({ where: { phone: normalizedPhone } })
  if (existing && existing.id !== payload.userId) {
    throw createError({ statusCode: 409, statusMessage: 'This phone number is already linked to another account' })
  }

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
