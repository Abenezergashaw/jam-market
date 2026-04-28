import { z } from 'zod'

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').trim()
}

const schema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  notes: z.string().optional().default(''),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1, 'Order must have at least one item'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid order data' })
  }

  const { phone, lat, lng, items } = parsed.data
  const customerName = stripHtml(parsed.data.customerName)
  const address = stripHtml(parsed.data.address)
  const notes = stripHtml(parsed.data.notes)

  // Attach customer if logged in
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

  const settings = await prisma.storeSettings.findFirst()
  let deliveryFee = 0
  if (settings?.storeLat != null && settings?.storeLng != null && lat != null && lng != null) {
    const distKm = haversineKm(
      Number(settings.storeLat), Number(settings.storeLng), lat, lng
    )
    deliveryFee = distKm * Number(settings.costPerKm) + totalPrice * Number(settings.serviceChargePct) / 100
  }
  const grandTotal = totalPrice + deliveryFee

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
        customerId,
        lat: lat ?? null,
        lng: lng ?? null,
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

  return {
    ...order,
    totalPrice: order.totalPrice.toString(),
    deliveryFee: order.deliveryFee.toString(),
    items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
  }
})
