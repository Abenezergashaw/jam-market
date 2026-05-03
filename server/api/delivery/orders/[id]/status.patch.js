// Delivery confirmation has moved to the customer side.
// Customers confirm receipt from their order history page.
export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    statusMessage: 'Delivery confirmation is now done by the customer. This endpoint is no longer available.',
  })
})
