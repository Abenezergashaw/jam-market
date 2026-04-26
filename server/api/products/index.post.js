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
  requireAdmin(event)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const { images, ...productData } = parsed.data

  const product = await prisma.product.create({
    data: {
      ...productData,
      images: {
        create: images.map((url, position) => ({ url, position })),
      },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
    },
  })

  return { ...product, price: product.price.toString(), costPrice: product.costPrice?.toString() ?? null }
})
