import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
const XLSX = _require('xlsx')
import { z } from 'zod'


// Convert empty-string cells (xlsx defval:'') to undefined so optional fields don't fail validation
const opt = (v) => (v === '' || v == null ? undefined : v)

const rowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be > 0'),
  imageUrl: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().default(''),
  brand: z.string().optional(),
  unit: z.string().optional(),
  weight: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  storageInstructions: z.string().optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  expiryDate: z.preprocess((v) => {
    if (!v || v === '') return undefined
    if (typeof v === 'number') {
      return XLSX.SSF.parse_date_code(v, { date1904: false })
        ? new Date(Math.round((v - 25569) * 864e5))
        : undefined
    }
    const d = new Date(v)
    return isNaN(d.getTime()) ? undefined : d
  }, z.date().optional().nullable()),
  costPrice: z.coerce.number().positive().optional().nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  isFeatured: z.preprocess((v) => {
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v === 1
    if (typeof v === 'string') return ['true', 'yes', '1'].includes(v.toLowerCase().trim())
    return false
  }, z.boolean().default(false)),
  image2Url: z.string().optional(),
  image3Url: z.string().optional(),
  image4Url: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const staff = requireCashier(event, null)
  const isAdmin = staff.role === 'admin' || staff.role === 'manager'

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

  const file = parts.find((p) => p.name === 'file' || p.filename)
  if (!file || !file.data?.length) throw createError({ statusCode: 400, statusMessage: 'No Excel file found' })

  let workbook
  try {
    workbook = XLSX.read(file.data, { type: 'buffer', cellDates: false })
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Could not read Excel file. Make sure it is a valid .xlsx or .xls file.' })
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (!rows.length) throw createError({ statusCode: 400, statusMessage: 'The spreadsheet is empty.' })

  // Validate all rows
  const errors = []
  const valid = []

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const result = rowSchema.safeParse({
      name: raw.name ?? raw.Name ?? '',
      sku: opt(raw.sku ?? raw.SKU ?? raw.Sku),
      price: raw.price ?? raw.Price ?? '',
      imageUrl: opt(raw.imageUrl ?? raw.image_url ?? raw['Image URL']),
      stock: raw.stock ?? raw.Stock ?? 0,
      description: raw.description ?? raw.Description ?? '',
      brand: opt(raw.brand ?? raw.Brand),
      unit: opt(raw.unit ?? raw.Unit),
      weight: opt(raw.weight ?? raw.Weight),
      countryOfOrigin: opt(raw.countryOfOrigin ?? raw.country_of_origin ?? raw['Country of Origin']),
      storageInstructions: opt(raw.storageInstructions ?? raw.storage_instructions ?? raw['Storage Instructions']),
      categoryId: opt(raw.categoryId ?? raw.category_id ?? raw['Category ID']),
      expiryDate: opt(raw.expiryDate ?? raw.expiry_date ?? raw['Expiry Date']),
      costPrice: opt(raw.costPrice ?? raw.cost_price ?? raw['Cost Price']),
      lowStockThreshold: raw.lowStockThreshold ?? raw.low_stock_threshold ?? raw['Low Stock Threshold'] ?? 10,
      isFeatured: raw.isFeatured ?? raw.is_featured ?? raw['Is Featured'] ?? false,
      image2Url: opt(raw.image2Url ?? raw['Image URL 2']),
      image3Url: opt(raw.image3Url ?? raw['Image URL 3']),
      image4Url: opt(raw.image4Url ?? raw['Image URL 4']),
    })

    if (!result.success) {
      errors.push({
        row: i + 2,
        name: raw.name ?? raw.Name ?? `Row ${i + 2}`,
        errors: result.error.errors.map((e) => e.message),
      })
    } else {
      valid.push(result.data)
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, validCount: valid.length }
  }

  // Nullify categoryIds that don't exist in the DB
  const categoryIdsInFile = [...new Set(valid.map((r) => r.categoryId).filter(Boolean))]
  if (categoryIdsInFile.length) {
    const existingCats = await prisma.category.findMany({
      where: { id: { in: categoryIdsInFile } },
      select: { id: true },
    })
    const validCatIds = new Set(existingCats.map((c) => c.id))
    for (const row of valid) {
      if (row.categoryId != null && !validCatIds.has(row.categoryId)) {
        row.categoryId = null
      }
    }
  }

  // Look up existing products by SKU for upsert logic
  const skusInFile = valid.map((r) => r.sku).filter(Boolean)
  const existingBySku = skusInFile.length
    ? await prisma.product.findMany({
        where: { sku: { in: skusInFile } },
        select: { id: true, sku: true },
      })
    : []
  const skuToId = Object.fromEntries(existingBySku.map((p) => [p.sku, p.id]))

  const toCreate = []
  const toUpdate = []

  for (const row of valid) {
    const existingId = row.sku ? skuToId[row.sku] : undefined
    if (existingId) {
      toUpdate.push({ id: existingId, row })
    } else {
      toCreate.push(row)
    }
  }

  const productData = (row) => ({
    name: row.name,
    sku: row.sku ?? null,
    price: row.price,
    imageUrl: row.imageUrl || null,
    stock: row.stock,
    description: row.description,
    brand: row.brand ?? null,
    unit: row.unit ?? null,
    weight: row.weight ?? null,
    countryOfOrigin: row.countryOfOrigin ?? null,
    storageInstructions: row.storageInstructions ?? null,
    categoryId: row.categoryId ?? null,
    expiryDate: row.expiryDate ?? null,
    costPrice: isAdmin ? (row.costPrice ?? null) : undefined,
    lowStockThreshold: row.lowStockThreshold,
    isFeatured: row.isFeatured,
  })

  const extraImages = (row) =>
    [row.image2Url, row.image3Url, row.image4Url]
      .filter(Boolean)
      .map((url, pos) => ({ url, position: pos + 1 }))

  await prisma.$transaction(async (tx) => {
    // Batch-create products without extra images
    const simpleCreates = toCreate.filter((row) => extraImages(row).length === 0)
    if (simpleCreates.length) {
      await tx.product.createMany({ data: simpleCreates.map(productData) })
    }

    // Individual create for products that have extra images
    const richCreates = toCreate.filter((row) => extraImages(row).length > 0)
    for (const row of richCreates) {
      await tx.product.create({
        data: { ...productData(row), images: { create: extraImages(row) } },
      })
    }

    // Update existing products matched by SKU
    for (const { id, row } of toUpdate) {
      const imgs = extraImages(row)
      await tx.product.update({ where: { id }, data: productData(row) })
      if (imgs.length) {
        await tx.productImage.deleteMany({ where: { productId: id } })
        await tx.productImage.createMany({ data: imgs.map((img) => ({ ...img, productId: id })) })
      }
    }
  }, { timeout: 60000 })

  await logAudit({ userId: staff.userId, role: staff.role }, event, {
    action: 'PRODUCTS_BULK_IMPORTED',
    entity: 'product',
    meta: { created: toCreate.length, updated: toUpdate.length },
  })

  return { ok: true, created: toCreate.length, updated: toUpdate.length }
})
