export default defineEventHandler(async (event) => {
  const p = requireDelivery(event)

  const orders = await prisma.order.findMany({
    where: { deliveryPersonId: p.userId },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Return operational fields only — no financial data
  return orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    notes: o.notes,
    status: o.status,
    lat: o.lat?.toString() ?? null,
    lng: o.lng?.toString() ?? null,
    createdAt: o.createdAt,
    deliveryPersonId: o.deliveryPersonId,
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      product: i.product,
    })),
  }))
})
