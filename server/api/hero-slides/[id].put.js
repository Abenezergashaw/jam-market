import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  ctaLabel: z.string().min(1).optional(),
  ctaHref: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  try {
    return await prisma.heroSlide.update({ where: { id }, data: parsed.data })
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Slide not found' })
    throw e
  }
})
