import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().default(''),
  role: z.enum(['admin', 'cashier', 'delivery']).default('admin'),
  storeId: z.number().int().positive().nullable().optional(),
  permissions: z.array(z.string()).default([]),
})

export default defineEventHandler(async (event) => {
  const adminPayload = requireAdmin(event)

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
        name: parsed.data.name,
        role: parsed.data.role,
        storeId: parsed.data.storeId ?? null,
        permissions: parsed.data.permissions,
      },
      select: { id: true, email: true, role: true, name: true, isActive: true, storeId: true, permissions: true },
    })

    await logAudit(adminPayload, event, {
      action: 'USER_CREATED',
      entity: 'user',
      entityId: user.id,
      meta: { email: user.email, role: user.role },
    })

    return user
  } catch (e) {
    if (e.code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
    throw e
  }
})
