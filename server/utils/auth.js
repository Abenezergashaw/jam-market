import jwt from 'jsonwebtoken'

export async function requireAdmin(event) {
  const payload = await requireStaff(event)
  if (payload.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return payload
}

export function requireCustomer(event) {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.role !== 'customer') throw new Error('Not customer')
    return payload
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}

export function getCustomerIfLoggedIn(event) {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, config.jwtSecret)
    return payload.role === 'customer' ? payload : null
  } catch {
    return null
  }
}

export function signToken(payload) {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' })
}

// Verifies any staff JWT (admin | cashier | delivery). Throws 401 if invalid.
export async function requireStaff(event) {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  let payload
  try {
    payload = jwt.verify(authHeader.slice(7), config.jwtSecret)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
  // Check the user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true },
  })
  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Account is inactive or has been removed' })
  }
  return payload
}

// Admin always passes. Cashier must have the optional permission string.
export async function requireCashier(event, permission = null) {
  const p = await requireStaff(event)
  if (p.role === 'admin') return p
  if (p.role !== 'cashier')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (permission && !p.permissions?.includes(permission))
    throw createError({ statusCode: 403, statusMessage: 'Permission denied' })
  return p
}

// Admin or delivery role only.
export async function requireDelivery(event) {
  const p = await requireStaff(event)
  if (p.role !== 'delivery' && p.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return p
}
