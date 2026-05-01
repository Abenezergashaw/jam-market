import { sendTelegramMessage } from '../utils/telegram.js'

const EXPIRY_MS = 2 * 60 * 60 * 1000       // 2 hours
const INTERVAL_MS = 15 * 60 * 1000          // check every 15 minutes
const ONLINE_METHODS = ['TELEBIRR', 'CBE', 'BOA']

async function expireUnverifiedOrders() {
  try {
    const cutoff = new Date(Date.now() - EXPIRY_MS)

    const expired = await prisma.order.findMany({
      where: {
        paymentMethod: { in: ONLINE_METHODS },
        paymentStatus: 'PENDING',
        status: { notIn: ['CANCELLED', 'DELIVERED'] },
        createdAt: { lt: cutoff },
      },
      include: {
        items: { select: { productId: true, quantity: true } },
        customer: { select: { telegramId: true } },
      },
    })

    for (const order of expired) {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            paymentNote: 'Auto-cancelled: payment not verified within 2 hours.',
          },
        })
      })

      if (order.customer?.telegramId) {
        await sendTelegramMessage(
          order.customer.telegramId,
          `❌ Your Jam Store order #${order.id} was cancelled because the ${order.paymentMethod} payment was not verified within 2 hours. Please place a new order.`,
        )
      }
    }

    if (expired.length > 0) {
      console.log(`[scheduler] Auto-cancelled ${expired.length} unverified order(s).`)
    }
  } catch (e) {
    console.error('[scheduler] expireUnverifiedOrders error:', e)
  }
}

export default defineNitroPlugin((nitroApp) => {
  // Run once shortly after startup, then on the interval
  setTimeout(expireUnverifiedOrders, 10_000)
  const timer = setInterval(expireUnverifiedOrders, INTERVAL_MS)
  nitroApp.hooks.hook('close', () => clearInterval(timer))
})
