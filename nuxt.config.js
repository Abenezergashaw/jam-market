export default defineNuxtConfig({
  ssr: true,

  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@sentry/nuxt/module"],

  sentry: {
    sourceMapsUploadOptions: {
      project: "jam-store",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  },

  css: ["~/assets/css/main.css", "leaflet/dist/leaflet.css"],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-prod",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    public: {
      telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME,
    },
  },

  app: {
    head: {
      title: "Jam Store",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Fresh groceries delivered fast" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-XSS-Protection': '1; mode=block',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
      },
    },
  },

  vite: {
    server: {
      allowedHosts: true, // This allows any host to connect
    },
  },

  compatibilityDate: "2024-09-10",
});
