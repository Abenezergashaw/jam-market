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
