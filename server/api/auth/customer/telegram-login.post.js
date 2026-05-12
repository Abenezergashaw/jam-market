import { createHash, createHmac } from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const { hash, ...data } = body

  if (!hash) throw createError({ statusCode: 400, statusMessage: 'Missing hash' })

  // Verify auth_date is fresh (within 24 hours)
  if (!data.auth_date || Date.now() / 1000 - Number(data.auth_date) > 86400) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication data is stale' })
  }

  // Verify hash: HMAC-SHA256 of sorted key=value pairs using SHA256(bot_token) as key
  const dataCheckString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n')

  const secretKey = createHash('sha256').update(config.telegramBotToken).digest()
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (expectedHash !== hash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Telegram authentication' })
  }

  const telegramId = BigInt(data.id)

  const customer = await prisma.customer.upsert({
    where: { telegramId },
    update: {
      firstName: data.first_name || 'User',
      lastName: data.last_name || null,
      username: data.username || null,
      photoUrl: data.photo_url || null,
    },
    create: {
      telegramId,
      firstName: data.first_name || 'User',
      lastName: data.last_name || null,
      username: data.username || null,
      photoUrl: data.photo_url || null,
    },
  })

  const token = signToken({ userId: customer.id, role: 'customer' })

  return {
    token,
    needsPhone: !customer.phone,
    user: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      photoUrl: customer.photoUrl,
      phone: customer.phone,
      email: customer.email,
    },
  }
})
