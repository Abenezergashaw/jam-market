export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Verify request is from Telegram using the secret token header
  const secret = getRequestHeader(event, 'x-telegram-bot-api-secret-token')
  if (config.telegramWebhookSecret && secret !== config.telegramWebhookSecret) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)
  const message = body?.message
  if (!message?.text || !message?.from) return { ok: true }

  const text = message.text.trim()
  const from = message.from

  // Extract code — handles plain "123456" or "/start 123456"
  let otp = null
  if (/^\d{6}$/.test(text)) {
    otp = text
  } else if (text.startsWith('/start ') && /^\d{6}$/.test(text.slice(7).trim())) {
    otp = text.slice(7).trim()
  } else if (text === '/start' || text.startsWith('/start')) {
    await sendTelegramMessage(from.id, '👋 Welcome to <b>Jam Store</b>!\n\nTo sign in, visit the website and send the 6-digit code shown there to this chat.')
    return { ok: true }
  } else {
    await sendTelegramMessage(from.id, 'Please send the <b>6-digit code</b> shown on the Jam Store sign-in page.')
    return { ok: true }
  }

  // Look up the OTP
  const record = await prisma.customerAuthToken.findUnique({ where: { otp } })

  if (!record || record.expiresAt < new Date()) {
    await sendTelegramMessage(from.id, '❌ This code is invalid or has expired.\n\nPlease refresh the sign-in page to get a new code.')
    return { ok: true }
  }

  if (record.verified) {
    await sendTelegramMessage(from.id, '✅ This code was already used. You should already be signed in on the website.')
    return { ok: true }
  }

  // Mark as verified with this user's Telegram info
  await prisma.customerAuthToken.update({
    where: { otp },
    data: {
      verified: true,
      telegramId: BigInt(from.id),
      firstName: from.first_name ?? '',
      lastName: from.last_name ?? null,
      username: from.username ?? null,
    },
  })

  const name = from.first_name ?? 'there'
  await sendTelegramMessage(from.id, `✅ Hi <b>${name}</b>! You're now signed in to Jam Store.\n\nHead back to the website — the page will refresh automatically.`)

  return { ok: true }
})
