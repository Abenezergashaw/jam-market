import { z } from 'zod'

const schema = z.object({
  reviewNote: z.string().trim().max(1000).optional(),
})

export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })

  const feedback = await prisma.storeFeedback.update({
    where: { id },
    data: {
      status: 'REVIEWED',
      reviewedAt: new Date(),
      reviewedById: payload.userId,
      reviewNote: parsed.data.reviewNote || null,
    },
  })

  await logAudit(payload, event, {
    action: 'FEEDBACK_REVIEWED',
    entity: 'store_feedback',
    entityId: id,
    meta: { reviewNote: parsed.data.reviewNote || null },
  })

  return { id: feedback.id, status: feedback.status }
})
