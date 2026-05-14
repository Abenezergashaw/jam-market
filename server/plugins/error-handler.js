export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!event) return

    const status = error.statusCode ?? 500

    // Client errors (4xx) have intentional messages — pass them through
    if (status >= 400 && status < 500) return

    // For 5xx: log the real error server-side, send a generic message to the client
    console.error('[server error]', event?.path, error?.message ?? error)

    // Replace the error message so DB host/credentials never reach the browser
    error.message = 'An unexpected error occurred. Please try again.'
    error.statusMessage = 'Server Error'

    // Strip stack trace and any data payload from the response
    delete error.stack
    delete error.data
  })
})
