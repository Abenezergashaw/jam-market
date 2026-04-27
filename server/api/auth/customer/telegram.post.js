import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  if (!body || !body.hash || !body.id || !body.auth_date) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Telegram auth data' })
  }

  // Verify Telegram signature
  const { hash, ...data } = body
  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(config.telegramBotToken).digest()
  const expectedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

  if (expectedHash !== hash) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram auth verification failed' })
  }

  // Check auth is fresh (within 24 hours)
  if (Math.floor(Date.now() / 1000) - Number(body.auth_date) > 86400) {
    throw createError({ statusCode: 401, statusMessage: 'Telegram auth data expired' })
  }

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { telegramId: BigInt(body.id) },
    update: {
      firstName: body.first_name,
      lastName: body.last_name ?? null,
      username: body.username ?? null,
      photoUrl: body.photo_url ?? null,
    },
    create: {
      telegramId: BigInt(body.id),
      firstName: body.first_name,
      lastName: body.last_name ?? null,
      username: body.username ?? null,
      phone: body.phone_number ?? null,
      photoUrl: body.photo_url ?? null,
    },
  })

  const token = signToken({ userId: customer.id, role: 'customer' })

  return {
    token,
    user: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      photoUrl: customer.photoUrl,
      phone: customer.phone,
    },
  }
})
