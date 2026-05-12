export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const stateCookie = getCookie(event, 'google_oauth_state')
  deleteCookie(event, 'google_oauth_state')

  if (!stateCookie || stateCookie !== query.state) {
    return sendRedirect(event, '/login?error=oauth_state')
  }

  if (query.error) {
    return sendRedirect(event, '/login?error=oauth_denied')
  }

  if (!query.code) {
    return sendRedirect(event, '/login?error=oauth_missing_code')
  }

  // Exchange code for tokens
  let tokenData
  try {
    tokenData = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: query.code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  } catch {
    return sendRedirect(event, '/login?error=oauth_token_exchange')
  }

  // Fetch user profile
  let profile
  try {
    profile = await $fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
  } catch {
    return sendRedirect(event, '/login?error=oauth_profile')
  }

  // Upsert customer by googleId
  const customer = await prisma.customer.upsert({
    where: { googleId: profile.sub },
    update: {
      firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
      lastName: profile.family_name || null,
      email: profile.email || null,
      photoUrl: profile.picture || null,
    },
    create: {
      googleId: profile.sub,
      email: profile.email || null,
      firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
      lastName: profile.family_name || null,
      photoUrl: profile.picture || null,
    },
  })

  const token = signToken({ userId: customer.id, role: 'customer' })

  if (!customer.phone) {
    return sendRedirect(event, `/login?token=${token}&step=phone`)
  }

  return sendRedirect(event, `/login?token=${token}`)
})
