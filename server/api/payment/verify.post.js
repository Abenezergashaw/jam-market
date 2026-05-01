export default defineEventHandler(async (event) => {
  requireCustomer(event)

  // TODO: integrate Telebirr reference code verification API
  throw createError({
    statusCode: 503,
    statusMessage: 'Payment verification is not yet available. Please upload your receipt instead.',
  })
})
