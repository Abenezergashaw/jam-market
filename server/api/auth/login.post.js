import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email or password format' })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, role: true, isActive: true, name: true, storeId: true, permissions: true },
  })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  if (!user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Account disabled' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

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
    user: { id: user.id, email: user.email, role: user.role, name: user.name, storeId: user.storeId ?? null, permissions: user.permissions ?? [] },
  }
})
