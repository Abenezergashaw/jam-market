import jwt from 'jsonwebtoken'

export function requireAdmin(event) {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.role !== 'admin') throw new Error('Not admin')
    return payload
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
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
export function requireStaff(event) {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  try {
    return jwt.verify(authHeader.slice(7), config.jwtSecret)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}

// Admin always passes. Cashier must have the optional permission string.
export function requireCashier(event, permission = null) {
  const p = requireStaff(event)
  if (p.role === 'admin') return p
  if (p.role !== 'cashier') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  if (permission && !p.permissions?.includes(permission)) {
    throw createError({ statusCode: 403, statusMessage: 'Permission denied' })
  }
  return p
}

// Admin or delivery role only.
export function requireDelivery(event) {
  const p = requireStaff(event)
  if (p.role !== 'delivery' && p.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return p
}
