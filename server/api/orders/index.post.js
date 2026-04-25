import { z } from 'zod'

const schema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  notes: z.string().optional().default(''),
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

  const { customerName, phone, address, notes, items } = parsed.data

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
        totalPrice,
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
    items: order.items.map((i) => ({ ...i, price: i.price.toString() })),
  }
})
