import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
const webpush = _require('web-push')
import * as Sentry from '@sentry/nuxt'

// Configure once at startup using env vars directly
const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@jamstore.com'

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

async function sendPush(sub, payload) {
  if (!publicKey || !privateKey) return
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    )
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } }).catch(() => {})
    } else {
      Sentry.captureException(err, { tags: { component: 'webpush' } })
    }
  }
}

export async function sendPushToCustomer(customerId, payload) {
  if (!customerId) return
  const subs = await prisma.pushSubscription.findMany({ where: { customerId } })
  for (const sub of subs) sendPush(sub, payload)
}

export async function sendPushToUser(userId, payload) {
  if (!userId) return
  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  for (const sub of subs) sendPush(sub, payload)
}

export async function sendPushToRole(roles, payload) {
  if (!roles?.length) return
  const subs = await prisma.pushSubscription.findMany({ where: { role: { in: roles } } })
  for (const sub of subs) sendPush(sub, payload)
}
