export default defineNuxtConfig({
  ssr: true,

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  app: {
    head: {
      title: 'Jam Store',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Fresh groceries delivered fast' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  compatibilityDate: '2024-09-10',
})
