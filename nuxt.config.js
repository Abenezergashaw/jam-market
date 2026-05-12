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
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@jamstore.com',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    public: {
      telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    },
  },

  app: {
    head: {
      title: "Jam Store",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Fresh groceries delivered fast" },
        { name: "theme-color", content: "#175B35" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "Jam Store" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { key: "manifest", rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
        { rel: "apple-touch-icon", sizes: "512x512", href: "/icons/icon-512.png" },
      ],
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
        'Service-Worker-Allowed': '/',
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
