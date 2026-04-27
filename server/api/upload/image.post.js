import { v2 as cloudinary } from 'cloudinary'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const config = useRuntimeConfig()
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })

  const contentLength = parseInt(getRequestHeader(event, 'content-length') || '0')
  if (contentLength > 5 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'File too large. Maximum size is 5MB' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const file = parts.find((p) => p.name === 'image' || p.filename)
  if (!file || !file.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No image found in upload' })
  }

  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'File too large. Maximum size is 5MB' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (file.type && !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Only JPEG, PNG, WebP and GIF images are allowed' })
  }

  const query = getQuery(event)
  const folder = query.folder === 'categories' ? 'jam-store/categories' : 'jam-store/products'

  const dataUri = `data:${file.type || 'image/jpeg'};base64,${file.data.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(dataUri, { folder, resource_type: 'image' })
    return { url: result.secure_url }
  } catch (e) {
    Sentry.captureException(e, { tags: { component: 'cloudinary-upload' } })
    throw createError({ statusCode: 500, statusMessage: e?.message ?? 'Image upload to Cloudinary failed' })
  }
})
