import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  images: z.array(z.string().min(1)).optional(),
  brand: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  storageInstructions: z.string().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const { images, ...productData } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: productData })

      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } })
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url, position) => ({ url, position, productId: id })),
          })
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: 'asc' } },
        },
      })
    })

    return { ...product, price: product.price.toString(), costPrice: product.costPrice?.toString() ?? null }
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    throw e
  }
})
