import { z } from 'zod'

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').trim()
}

const schema = z.object({
  customerName:   z.string().min(1, 'Name is required'),
  phone:          z.string().min(1, 'Phone is required'),
  address:        z.string().min(1, 'Address is required'),
  notes:          z.string().optional().default(''),
  lat:            z.number().optional().nullable(),
  lng:            z.number().optional().nullable(),
  paymentMethod:        z.enum(['CASH', 'TELEBIRR', 'CBE', 'BOA']).default('CASH'),
  receiptImageUrl:      z.string().url().optional(),
  paymentReferenceCode: z.string().max(100).optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity:  z.number().int().positive(),
  })).min(1, 'Order must have at least one item'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid order data' })
  }

  const { phone, lat, lng, items, paymentMethod, receiptImageUrl, paymentReferenceCode } = parsed.data
  const customerName = stripHtml(parsed.data.customerName)
  const address = stripHtml(parsed.data.address)
  const notes = stripHtml(parsed.data.notes)

  const customer = getCustomerIfLoggedIn(event)
  const customerId = customer ? customer.userId : null

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  if (products.length !== productIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'One or more products not found' })
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (product.stock < item.quantity) {
      throw createError({ statusCode: 400, statusMessage: `Not enough stock for "${product.name}"` })
    }
  }

  const totalPrice = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)
    return sum + Number(product.price) * item.quantity
  }, 0)

  const [settings, defaultStore] = await Promise.all([
    prisma.$queryRaw`SELECT store_is_open, min_order_amount, cost_per_km, service_charge_pct FROM store_settings LIMIT 1`.then(r => r[0] ?? null),
    prisma.store.findFirst({ orderBy: { id: 'asc' } }),
  ])

  if (settings && settings.store_is_open === false) {
    throw createError({ statusCode: 503, statusMessage: 'We are not accepting orders at the moment. Please check back soon.' })
  }

  const storeId = defaultStore?.id ?? null
  let deliveryFee = 0
  let distanceFee = 0
  let distKm = null

  if (defaultStore && lat != null && lng != null && defaultStore.lat != null && defaultStore.lng != null) {
    const effectiveCostPerKm = defaultStore.costPerKm != null
      ? Number(defaultStore.costPerKm)
      : Number(settings?.cost_per_km ?? 0)
    const effectiveServiceChargePct = defaultStore.serviceChargePct != null
      ? Number(defaultStore.serviceChargePct)
      : Number(settings?.service_charge_pct ?? 0)
    distKm = haversineKm(Number(defaultStore.lat), Number(defaultStore.lng), lat, lng)
    distanceFee = distKm * effectiveCostPerKm
    deliveryFee = distanceFee + totalPrice * effectiveServiceChargePct / 100
  }

  if (paymentMethod === 'CASH' && distKm !== null && distKm > 15) {
    throw createError({ statusCode: 400, statusMessage: 'Cash payment is only available within 15 km of the store' })
  }
  if (paymentMethod !== 'CASH' && !receiptImageUrl && !paymentReferenceCode) {
    throw createError({ statusCode: 400, statusMessage: 'A payment receipt or reference code is required for online payment orders' })
  }

  // Auto-apply best active promotion
  const now = new Date()
  const activePromos = await prisma.promotion.findMany({
    where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
  })

  let discountAmount = 0
  let appliedPromoId = null
  let bestDiscount = 0

  for (const promo of activePromos) {
    const minOrder = Number(promo.minOrderAmount)
    if (totalPrice < minOrder) continue

    let d = 0
    if (promo.type === 'FREE_DELIVERY') {
      d = distanceFee
    } else if (promo.type === 'PERCENT_OFF') {
      d = totalPrice * Number(promo.value) / 100
      if (promo.maxDiscount) d = Math.min(d, Number(promo.maxDiscount))
    } else if (promo.type === 'FLAT_OFF') {
      d = Math.min(Number(promo.value), totalPrice + deliveryFee)
    }

    if (d > bestDiscount) {
      bestDiscount = d
      discountAmount = d
      appliedPromoId = promo.id
    }
  }

  const grandTotal = Math.max(0, totalPrice + deliveryFee - discountAmount)

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return tx.order.create({
      data: {
        customerName,
        phone,
        address,
        notes,
        totalPrice: grandTotal,
        deliveryFee,
        serviceCharge: deliveryFee - distanceFee,
        discountAmount,
        promotionId: appliedPromoId,
        customerId,
        storeId: storeId ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        paymentMethod,
        receiptImageUrl: receiptImageUrl ?? null,
        paymentReferenceCode: paymentReferenceCode ?? null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find((p) => p.id === item.productId).price,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    })
  })

  // Notify admin + cashier of new order (fire-and-forget)
  sendPushToRole(['admin', 'cashier', 'manager'], {
    title: '🛒 New Order',
    body: `Order #${order.id} just came in.`,
    url: '/admin/orders',
    tag: `new-order-${order.id}`,
  })

  return {
    ...order,
    totalPrice: order.totalPrice.toString(),
    deliveryFee: order.deliveryFee.toString(),
    discountAmount: order.discountAmount.toString(),
    items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
  }
})
