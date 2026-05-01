export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const term = String(query.q ?? '').trim()
  const categorySlug = query.category ? String(query.category).trim() : null
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(60, Math.max(1, parseInt(query.limit) || 20))
  const skip = (page - 1) * limit
  const isFirstPage = page === 1

  if (term.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Search query must be at least 2 characters' })
  }

  let categoryId = null
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } })
    categoryId = cat?.id ?? null
  }

  const containsWhere = {
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { brand: { contains: term, mode: 'insensitive' } },
    ],
    ...(categoryId ? { categoryId } : {}),
  }

  const baseQueries = [
    prisma.product.findMany({
      where: containsWhere,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: 'asc' } },
      },
      take: limit,
      skip,
    }),
    prisma.product.count({ where: containsWhere }),
  ]

  if (isFirstPage) {
    baseQueries.push(
      categoryId
        ? prisma.$queryRaw`SELECT id FROM products WHERE (similarity(name, ${term}) > 0.25 OR similarity(COALESCE(brand,''), ${term}) > 0.25) AND category_id = ${categoryId} ORDER BY GREATEST(similarity(name, ${term}), similarity(COALESCE(brand,''), ${term})) DESC LIMIT 20`
        : prisma.$queryRaw`SELECT id FROM products WHERE (similarity(name, ${term}) > 0.25 OR similarity(COALESCE(brand,''), ${term}) > 0.25) ORDER BY GREATEST(similarity(name, ${term}), similarity(COALESCE(brand,''), ${term})) DESC LIMIT 20`,
      prisma.category.findMany({
        where: { name: { contains: term, mode: 'insensitive' } },
        take: 5,
      }),
      prisma.$queryRaw`SELECT id FROM categories WHERE similarity(name, ${term}) > 0.3 ORDER BY similarity(name, ${term}) DESC LIMIT 5`,
    )
  }

  const results = await Promise.all(baseQueries)
  const containsProducts = results[0]
  const total = results[1]

  // Merge fuzzy product hits
  const existingIds = new Set(containsProducts.map(p => p.id))
  const fuzzyProductIdSet = new Set()
  let mergedProducts = [...containsProducts]

  if (isFirstPage) {
    const fuzzyProductRows = results[2]
    const catContains = results[3]
    const fuzzyCatRows = results[4]

    for (const r of fuzzyProductRows) {
      fuzzyProductIdSet.add(Number(r.id))
    }

    const newFuzzyIds = [...fuzzyProductIdSet].filter(id => !existingIds.has(id))
    if (newFuzzyIds.length > 0) {
      const fuzzyProducts = await prisma.product.findMany({
        where: { id: { in: newFuzzyIds } },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: 'asc' } },
        },
      })
      mergedProducts.push(...fuzzyProducts)
    }

    // Build category list: merge contains + trgm hits
    const catMap = new Map(catContains.map(c => [c.id, c]))
    const newFuzzyCatIds = fuzzyCatRows.map(r => Number(r.id)).filter(id => !catMap.has(id))
    if (newFuzzyCatIds.length > 0) {
      const fuzzyCategories = await prisma.category.findMany({ where: { id: { in: newFuzzyCatIds } } })
      for (const c of fuzzyCategories) catMap.set(c.id, c)
    }

    const qLower = term.toLowerCase()
    const scoredCats = Array.from(catMap.values()).map(c => {
      const nameLower = c.name.toLowerCase()
      let score = nameLower === qLower ? 8 : nameLower.includes(qLower) ? 5 : 3
      return { cat: c, score }
    })
    scoredCats.sort((a, b) => b.score - a.score)

    const categories = scoredCats.slice(0, 5).map(({ cat }) => cat)

    const qLower2 = term.toLowerCase()
    const scoredProducts = mergedProducts.map(p => {
      const nameLower = p.name.toLowerCase()
      const brandLower = (p.brand ?? '').toLowerCase()
      const descLower = (p.description ?? '').toLowerCase()
      let score = 0
      if (nameLower === qLower2) score += 10
      else if (nameLower.includes(qLower2)) score += 5
      if (brandLower.includes(qLower2)) score += 3
      if (descLower.includes(qLower2)) score += 1
      if (fuzzyProductIdSet.has(p.id) && score === 0) score += 2
      return { product: p, score }
    })
    scoredProducts.sort((a, b) => b.score - a.score)
    const finalProducts = scoredProducts.slice(0, limit).map(({ product }) => product)

    return {
      products: finalProducts.map(({ costPrice, expiryDate, ...p }) => ({ ...p, price: p.price.toString() })),
      categories,
      total,
      page,
    }
  }

  // Subsequent pages: simple scoring on contains results only
  const qLower = term.toLowerCase()
  const scoredProducts = containsProducts.map(p => {
    const nameLower = p.name.toLowerCase()
    const brandLower = (p.brand ?? '').toLowerCase()
    const descLower = (p.description ?? '').toLowerCase()
    let score = 0
    if (nameLower === qLower) score += 10
    else if (nameLower.includes(qLower)) score += 5
    if (brandLower.includes(qLower)) score += 3
    if (descLower.includes(qLower)) score += 1
    return { product: p, score }
  })
  scoredProducts.sort((a, b) => b.score - a.score)

  return {
    products: scoredProducts.map(({ product: { costPrice, expiryDate, ...p } }) => ({ ...p, price: p.price.toString() })),
    categories: [],
    total,
    page,
  }
})
