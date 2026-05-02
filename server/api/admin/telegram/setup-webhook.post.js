export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const config = useRuntimeConfig(event)

  if (!config.telegramBotToken) {
    throw createError({ statusCode: 500, statusMessage: 'TELEGRAM_BOT_TOKEN is not configured' })
  }

  const { siteUrl } = await readBody(event)
  const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/telegram/webhook`

  const result = await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/setWebhook`, {
    method: 'POST',
    body: {
      url: webhookUrl,
      ...(config.telegramWebhookSecret ? { secret_token: config.telegramWebhookSecret } : {}),
      allowed_updates: ['message'],
    },
  })

  return { ok: result.ok, description: result.description, webhookUrl }
})
