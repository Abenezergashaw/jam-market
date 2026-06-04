import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)

  const body = await readBody(event)
  if (body?.confirm !== 'WIPE EVERYTHING') {
    throw createError({ statusCode: 400, statusMessage: 'Confirmation text did not match' })
  }

  const config = useRuntimeConfig()
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })

  const results = {}

  // 1. Wipe DB — order matters (children before parents)
  const [
    orderItems, orders, productImages, productReviews,
    productLocations, conversations, specialOrders,
    storeFeedback, auditLogs, promotions, products, categories,
  ] = await Promise.all([
    prisma.orderItem.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.productImage.deleteMany({}),
    prisma.productReview.deleteMany({}),
    prisma.productLocation.deleteMany({}),
    prisma.conversation.deleteMany({}),
    prisma.specialOrderRequest.deleteMany({}),
    prisma.storeFeedback.deleteMany({}),
    prisma.auditLog.deleteMany({}),
    prisma.promotion.deleteMany({}),
    prisma.product.deleteMany({}),
    prisma.category.deleteMany({}),
  ])

  results.db = {
    orderItems: orderItems.count,
    orders: orders.count,
    productImages: productImages.count,
    productReviews: productReviews.count,
    productLocations: productLocations.count,
    conversations: conversations.count,
    specialOrders: specialOrders.count,
    feedback: storeFeedback.count,
    auditLogs: auditLogs.count,
    promotions: promotions.count,
    products: products.count,
    categories: categories.count,
  }

  // 2. Wipe Cloudinary folders
  results.cloudinary = {}
  for (const folder of ['jam-store/products', 'jam-store/categories']) {
    try {
      await cloudinary.api.delete_resources_by_prefix(folder)
      await cloudinary.api.delete_folder(folder)
      results.cloudinary[folder] = 'deleted'
    } catch (e) {
      results.cloudinary[folder] = `skipped: ${e?.message ?? 'unknown error'}`
    }
  }

  await logAudit(payload, event, {
    action: 'DATABASE_WIPED',
    entity: 'system',
    meta: results.db,
  })

  return { ok: true, results }
})
