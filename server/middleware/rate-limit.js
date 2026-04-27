const WINDOW_MS = 60 * 1000

const RULES = [
  { test: (path, method) => path.startsWith('/api/auth/'), bucket: 'auth', limit: 10 },
  { test: (path, method) => path === '/api/orders' && method === 'POST', bucket: 'order-create', limit: 5 },
  { test: (path) => path.startsWith('/api/products/search'), bucket: 'search', limit: 30 },
]

// { "ip:bucket": { count, resetAt } }
const store = new Map()

// Purge expired entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

function check(ip, bucket, limit) {
  const key = `${ip}:${bucket}`
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS }
    store.set(key, entry)
    return { allowed: true, retryAfter: 0 }
  }

  entry.count++
  if (entry.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfter: 0 }
}

export default defineEventHandler((event) => {
  const path = event.path ?? getRequestURL(event).pathname
  const method = getMethod(event)

  const rule = RULES.find((r) => r.test(path, method))
  if (!rule) return

  const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const { allowed, retryAfter } = check(ip, rule.bucket, rule.limit)

  if (!allowed) {
    setResponseStatus(event, 429)
    setResponseHeader(event, 'Retry-After', String(retryAfter))
    setResponseHeader(event, 'Content-Type', 'application/json')
    return { statusCode: 429, statusMessage: 'Too Many Requests', retryAfter }
  }
})
