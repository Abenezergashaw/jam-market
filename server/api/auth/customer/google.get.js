import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.googleClientId) {
    throw createError({ statusCode: 503, statusMessage: 'Google login is not configured' })
  }

  const state = randomBytes(16).toString('hex')

  setCookie(event, 'google_oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
  })

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})
