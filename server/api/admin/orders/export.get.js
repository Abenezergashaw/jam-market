export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const where = {}

  if (query.from) where.createdAt = { ...where.createdAt, gte: new Date(query.from) }
  if (query.to) where.createdAt = { ...where.createdAt, lte: new Date(query.to) }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  })

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

  const header = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Items', 'Total (ETB)', 'Status', 'Payment'].join(',')

  const rows = orders.map((o) => {
    const items = o.items.map((i) => `${i.product?.name ?? '?'} x${i.quantity}`).join('; ')
    return [
      o.id,
      new Date(o.createdAt).toISOString().slice(0, 16).replace('T', ' '),
      escape(o.customerName),
      escape(o.phone),
      escape(o.address),
      escape(items),
      Number(o.totalPrice).toFixed(2),
      o.status,
      o.paymentStatus,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  setHeader(event, 'Content-Type', 'text/csv')
  setHeader(event, 'Content-Disposition', 'attachment; filename="orders.csv"')

  return csv
})
