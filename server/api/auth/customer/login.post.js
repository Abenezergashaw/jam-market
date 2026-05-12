import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const { phone, password } = await readBody(event)

  if (!phone?.trim()) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' })
  if (!password) throw createError({ statusCode: 400, statusMessage: 'Password is required' })

  const normalizedPhone = normalizePhone(phone.trim())

  const customer = await prisma.customer.findUnique({ where: { phone: normalizedPhone } })

  if (!customer) throw createError({ statusCode: 401, statusMessage: 'Incorrect phone number or password' })

  if (!customer.passwordHash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'This account uses social login. Sign in with Google or Telegram instead.',
    })
  }

  const valid = await bcrypt.compare(password, customer.passwordHash)
  if (!valid) throw createError({ statusCode: 401, statusMessage: 'Incorrect phone number or password' })

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
