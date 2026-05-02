import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens'),
  imageUrl: z.string().min(1),
  isTrending: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'categories:create')

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  try {
    const category = await prisma.category.create({ data: parsed.data })

    await logAudit(payload, event, {
      action: 'CATEGORY_CREATED',
      entity: 'category',
      entityId: category.id,
      meta: { name: category.name, slug: category.slug },
    })

    return category
  } catch (e) {
    if (e.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'A category with this slug already exists' })
    }
    throw e
  }
})
