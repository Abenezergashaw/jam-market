import { z } from 'zod'

const schema = z.object({
  name: z.string().optional(),
  storeId: z.number().int().positive().nullable().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['admin', 'cashier', 'delivery']).optional(),
})

export default defineEventHandler(async (event) => {
  const payload = requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, role: true, name: true, isActive: true, storeId: true, permissions: true },
  }).catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  })

  await logAudit(payload, event, {
    action: 'USER_UPDATED',
    entity: 'user',
    entityId: id,
    meta: { fields: Object.keys(parsed.data) },
  })

  return user
})
