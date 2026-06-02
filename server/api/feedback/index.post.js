import { z } from 'zod'

const schema = z.object({
  storeId: z.number().int().positive().optional().nullable(),
  name:    z.string().trim().max(100).optional(),
  phone:   z.string().trim().max(30).optional(),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
  rating:  z.number().int().min(1).max(5).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })

  const { storeId, name, phone, message, rating } = parsed.data

  const feedback = await prisma.storeFeedback.create({
    data: {
      storeId: storeId ?? null,
      name: name || null,
      phone: phone || null,
      message,
      rating: rating ?? null,
    },
  })

  return { id: feedback.id, createdAt: feedback.createdAt.toISOString() }
})
