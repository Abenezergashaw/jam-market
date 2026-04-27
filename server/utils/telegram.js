import * as Sentry from '@sentry/nuxt'

export async function sendTelegramMessage(chatId, text) {
  const config = useRuntimeConfig()
  if (!config.telegramBotToken || !chatId) return
  try {
    await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: { chat_id: Number(chatId), text, parse_mode: 'HTML' },
    })
  } catch (e) {
    // Non-critical — never fail the status update over a notification
    Sentry.captureException(e, { tags: { component: 'telegram-notify' } })
  }
}
