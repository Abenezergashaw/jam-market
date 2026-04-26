import { z } from 'zod'

const schema = z.object({
  stock: z.number().int().min(0),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stock value' })
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { stock: parsed.data.stock },
      select: { id: true, stock: true, lowStockThreshold: true },
    })
    return product
  } catch (e) {
    if (e.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    throw e
  }
})
