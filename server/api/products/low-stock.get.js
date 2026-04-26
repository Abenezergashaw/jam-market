export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const all = await prisma.product.findMany({
    include: { category: { select: { id: true, name: true } } },
    orderBy: { stock: 'asc' },
  })

  const products = all.filter((p) => p.stock <= p.lowStockThreshold)

  return products.map((p) => ({
    ...p,
    price: p.price.toString(),
    costPrice: p.costPrice?.toString() ?? null,
  }))
})
