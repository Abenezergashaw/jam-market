export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  const { productName, brand, madeIn, size, color, quantity, notes, imageUrl } = await readBody(event)

  if (!productName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Product name is required' })
  }
  if (!quantity || quantity < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Quantity must be at least 1' })
  }

  const request = await prisma.specialOrderRequest.create({
    data: {
      customerId: customer.userId,
      productName: productName.trim(),
      brand: brand?.trim() || null,
      madeIn: madeIn?.trim() || null,
      size: size?.trim() || null,
      color: color?.trim() || null,
      quantity: parseInt(quantity),
      notes: notes?.trim() || null,
      imageUrl: imageUrl || null,
      status: 'PENDING',
    },
  })

  return request
})
