import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
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
  reason: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
  const payload = requireCashier(event, 'products:edit')

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })
  }

  const { images, costPrice, reason, ...productData } = parsed.data

  // Only admins can update cost price
  const dataToWrite = {
    ...productData,
    ...(payload.role === 'admin' && costPrice !== undefined ? { costPrice } : {}),
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: dataToWrite })

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

    await logAudit(payload, event, {
      action: 'PRODUCT_UPDATED',
      entity: 'product',
      entityId: id,
      meta: { reason: reason ?? null },
    })

    const result = { ...product, price: product.price.toString() }
    if (payload.role === 'admin') result.costPrice = product.costPrice?.toString() ?? null
    return result
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    throw e
  }
})
