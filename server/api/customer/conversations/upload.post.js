import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  requireCustomer(event)

  const config = useRuntimeConfig()
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })

  const contentLength = parseInt(getRequestHeader(event, 'content-length') || '0')
  if (contentLength > 5 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'File too large. Maximum size is 5 MB' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

  const file = parts.find((p) => p.name === 'file' || p.filename)
  if (!file || !file.data?.length) throw createError({ statusCode: 400, statusMessage: 'No image found in upload' })

  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'File too large. Maximum size is 5 MB' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (file.type && !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Only JPEG, PNG, and WebP images are allowed' })
  }

  const dataUri = `data:${file.type || 'image/jpeg'};base64,${file.data.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'jam-store/conversations',
      resource_type: 'image',
    })
    return { imageUrl: result.secure_url }
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: e?.message ?? 'Image upload failed' })
  }
})
