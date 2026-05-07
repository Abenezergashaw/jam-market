import { z } from 'zod'

const schema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  // Accept customer or any staff token
  let payload
  try {
    payload = requireCustomer(event)
  } catch {
    payload = requireStaff(event)
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid subscription data' })

  const { endpoint, p256dh, auth } = parsed.data

  const data = {
    role: payload.role,
    p256dh,
    auth,
    ...(payload.role === 'customer'
      ? { customerId: payload.userId, userId: null }
      : { userId: payload.userId, customerId: null }),
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: data,
    create: { endpoint, ...data },
  })

  return { ok: true }
})
