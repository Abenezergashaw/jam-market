import { z } from 'zod'

const schema = z.object({
  locations: z.array(z.object({
    storeId: z.number().int().positive(),
    aisle: z.string().max(50).optional().nullable(),
    shelf: z.string().max(50).optional().nullable(),
  })),
})

export default defineEventHandler(async (event) => {
  const payload = await requireCashier(event, 'products:edit')

  const productId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message ?? 'Invalid data' })

  const { locations } = parsed.data

  await prisma.$transaction(
    locations.map(({ storeId, aisle, shelf }) =>
      prisma.productLocation.upsert({
        where: { productId_storeId: { productId, storeId } },
        update: { aisle: aisle || null, shelf: shelf || null },
        create: { productId, storeId, aisle: aisle || null, shelf: shelf || null },
      })
    )
  )

  await logAudit(payload, event, {
    action: 'PRODUCT_LOCATIONS_UPDATED',
    entity: 'product',
    entityId: productId,
    meta: { storeCount: locations.length },
  })

  return { ok: true }
})
