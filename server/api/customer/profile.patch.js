import { z } from 'zod'

const schema = z.object({
  phone: z.string().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid data' })
  }

  const updated = await prisma.customer.update({
    where: { id: customer.userId },
    data: { phone: parsed.data.phone },
    select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true, phone: true },
  })

  return updated
})
