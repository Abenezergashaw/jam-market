import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  tag: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  imageUrl: z.string().min(1),
  position: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }
  return prisma.heroSlide.create({ data: parsed.data })
})
