import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().positive(),
  imageUrl: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  categoryId: z.number().int().positive().nullable().optional(),
  images: z.array(z.string().min(1)).default([]),
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
      category: { select: { id: true, name: true } },
      images: { orderBy: { position: 'asc' } },
    },
  })

  return { ...product, price: product.price.toString() }
})
