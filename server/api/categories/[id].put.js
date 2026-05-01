import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  imageUrl: z.string().min(1).optional(),
  isTrending: z.boolean().optional(),
  reason: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'categories:edit')

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const { reason, ...data } = parsed.data

  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    })

    await logAudit(payload, event, {
      action: 'CATEGORY_UPDATED',
      entity: 'category',
      entityId: id,
      meta: { name: category.name, reason: reason ?? null },
    })

    return category
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    if (e.code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
    throw e
  }
})
