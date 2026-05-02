export default defineEventHandler(async (event) => {
  const { otp } = await readBody(event)

  if (!otp || !/^\d{6}$/.test(otp)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OTP' })
  }

  const record = await prisma.customerAuthToken.findUnique({ where: { otp } })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'OTP not found' })
  }

  if (record.expiresAt < new Date()) {
    await prisma.customerAuthToken.delete({ where: { otp } }).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'OTP expired' })
  }

  if (!record.verified) {
    return { verified: false }
  }

  // Verified — upsert customer and issue JWT
  const customer = await prisma.customer.upsert({
    where: { telegramId: record.telegramId },
    update: {
      firstName: record.firstName ?? '',
      lastName: record.lastName ?? null,
      username: record.username ?? null,
    },
    create: {
      telegramId: record.telegramId,
      firstName: record.firstName ?? '',
      lastName: record.lastName ?? null,
      username: record.username ?? null,
    },
  })

  await prisma.customerAuthToken.delete({ where: { otp } }).catch(() => {})

  const token = signToken({ userId: customer.id, role: 'customer' })

  return {
    verified: true,
    token,
    user: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      photoUrl: customer.photoUrl,
      phone: customer.phone,
    },
  }
})
