import { z } from 'zod'

const schema = z.object({
  stock: z.number().int().min(0),
})

export default defineEventHandler(async (event) => {
  const payload = requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stock value' })
  }

  try {
    const before = await prisma.product.findUnique({ where: { id }, select: { stock: true } })

    const product = await prisma.product.update({
      where: { id },
      data: { stock: parsed.data.stock },
      select: { id: true, stock: true, lowStockThreshold: true },
    })

    await logAudit(payload, event, {
      action: 'STOCK_UPDATED',
      entity: 'product',
      entityId: id,
      meta: { from: before?.stock ?? null, to: parsed.data.stock },
    })

    return product
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    throw e
  }
})
