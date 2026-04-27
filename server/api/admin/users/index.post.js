import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'super_admin']).default('admin'),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      },
      select: { id: true, email: true, role: true, isActive: true },
    })
    return user
  } catch (e) {
    if (e.code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
    throw e
  }
})
