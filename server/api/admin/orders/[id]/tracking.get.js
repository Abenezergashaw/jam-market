export default defineEventHandler(async (event) => {
  requireStaff(event)
  const id = parseInt(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      status: true,
      lat: true,
      lng: true,
      address: true,
      deliveryPersonId: true,
      deliveryPerson: { select: { id: true, name: true, email: true, lat: true, lng: true, locationUpdatedAt: true } },
      store: { select: { id: true, name: true, lat: true, lng: true } },
    },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  return {
    store: order.store
      ? { name: order.store.name, lat: order.store.lat?.toString() ?? null, lng: order.store.lng?.toString() ?? null }
      : null,
    deliveryPerson: order.deliveryPerson
      ? {
          name: order.deliveryPerson.name || order.deliveryPerson.email,
          lat: order.deliveryPerson.lat?.toString() ?? null,
          lng: order.deliveryPerson.lng?.toString() ?? null,
          locationUpdatedAt: order.deliveryPerson.locationUpdatedAt?.toISOString() ?? null,
        }
      : null,
    customerLat: order.lat?.toString() ?? null,
    customerLng: order.lng?.toString() ?? null,
    customerAddress: order.address,
  }
})
