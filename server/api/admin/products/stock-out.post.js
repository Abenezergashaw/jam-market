export default defineEventHandler(async (event) => {
  const payload = await requireAdmin(event)

  const { count } = await prisma.product.updateMany({ data: { stock: 0 } })

  await logAudit(payload, event, {
    action: 'STOCK_ALL_OUT',
    entity: 'product',
    meta: { productsAffected: count },
  })

  return { ok: true, count }
})
