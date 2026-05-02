export default defineEventHandler(async (event) => {
  // Delete expired tokens to keep the table clean
  await prisma.customerAuthToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  // Generate unique 6-digit OTP
  let otp
  let attempts = 0
  do {
    otp = String(Math.floor(100000 + Math.random() * 900000))
    const existing = await prisma.customerAuthToken.findUnique({ where: { otp } })
    if (!existing) break
    attempts++
  } while (attempts < 5)

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.customerAuthToken.create({ data: { otp, expiresAt } })

  return { otp, expiresAt: expiresAt.toISOString() }
})
