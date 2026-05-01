import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().positive(),
  imageUrl: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  categoryId: z.number().int().positive().nullable().optional(),
  images: z.array(z.string().min(1)).default([]),
  brand: z.string().optional(),
  unit: z.string().optional(),
  weight: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  storageInstructions: z.string().optional(),
  expiryDate: z.coerce.date().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(10),
  isFeatured: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'products:create')

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const { images, costPrice, ...productData } = parsed.data

  // Only admins can set cost price
  const dataToWrite = {
    ...productData,
    ...(payload.role === 'admin' && costPrice != null ? { costPrice } : {}),
  }

  const product = await prisma.product.create({
    data: {
      ...dataToWrite,
      images: {
        create: images.map((url, position) => ({ url, position })),
      },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
    },
  })

  await logAudit(payload, event, {
    action: 'PRODUCT_CREATED',
    entity: 'product',
    entityId: product.id,
    meta: { name: product.name, price: product.price.toString(), stock: product.stock },
  })

  const result = { ...product, price: product.price.toString() }
  if (payload.role === 'admin') result.costPrice = product.costPrice?.toString() ?? null
  return result
})
