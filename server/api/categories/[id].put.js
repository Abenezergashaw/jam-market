import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  imageUrl: z.string().min(1).optional(),
  isTrending: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  try {
    return await prisma.category.update({
      where: { id },
      data: parsed.data,
    })
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    if (e.code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
    throw e
  }
})
