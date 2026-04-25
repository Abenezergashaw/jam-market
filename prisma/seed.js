const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@jamstore.com' },
    update: {},
    create: { email: 'admin@jamstore.com', passwordHash, role: 'admin' },
  })
  console.log('Admin user: admin@jamstore.com / admin123')

  // Categories
  const categoryData = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', imageUrl: 'https://picsum.photos/seed/fruits-veg/400/300', isTrending: true },
    { name: 'Dairy & Eggs', slug: 'dairy-eggs', imageUrl: 'https://picsum.photos/seed/dairy-eggs/400/300', isTrending: true },
    { name: 'Bakery', slug: 'bakery', imageUrl: 'https://picsum.photos/seed/bakery-goods/400/300', isTrending: false },
    { name: 'Beverages', slug: 'beverages', imageUrl: 'https://picsum.photos/seed/beverages-drinks/400/300', isTrending: false },
    { name: 'Snacks', slug: 'snacks', imageUrl: 'https://picsum.photos/seed/snacks-food/400/300', isTrending: false },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl, isTrending: cat.isTrending },
      create: cat,
    })
  }

  const cats = await prisma.category.findMany()
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]))

  // Only seed products if none exist
  const productCount = await prisma.product.count()
  if (productCount === 0) {
    const products = [
      // Fruits & Vegetables
      { name: 'Organic Bananas', description: 'Sweet and ripe organic bananas, sold per bunch', price: 1.99, imageUrl: 'https://picsum.photos/seed/bananas-bunch/400/400', stock: 50, categoryId: catMap['fruits-vegetables'] },
      { name: 'Cherry Tomatoes', description: 'Vine-ripened cherry tomatoes, 500g punnet', price: 2.49, imageUrl: 'https://picsum.photos/seed/cherry-tomatoes/400/400', stock: 40, categoryId: catMap['fruits-vegetables'] },
      { name: 'Hass Avocados', description: 'Creamy ready-to-eat Hass avocados', price: 3.99, imageUrl: 'https://picsum.photos/seed/hass-avocado/400/400', stock: 30, categoryId: catMap['fruits-vegetables'] },
      { name: 'Baby Spinach 200g', description: 'Pre-washed baby spinach leaves', price: 2.99, imageUrl: 'https://picsum.photos/seed/baby-spinach/400/400', stock: 25, categoryId: catMap['fruits-vegetables'] },

      // Dairy & Eggs
      { name: 'Full Cream Milk 1L', description: 'Fresh full cream milk from local farms', price: 1.49, imageUrl: 'https://picsum.photos/seed/full-cream-milk/400/400', stock: 60, categoryId: catMap['dairy-eggs'] },
      { name: 'Free-Range Eggs × 12', description: 'Large free-range eggs', price: 4.99, imageUrl: 'https://picsum.photos/seed/free-range-eggs/400/400', stock: 45, categoryId: catMap['dairy-eggs'] },
      { name: 'Greek Yogurt 500g', description: 'Thick and creamy strained Greek yogurt', price: 3.49, imageUrl: 'https://picsum.photos/seed/greek-yogurt-pot/400/400', stock: 35, categoryId: catMap['dairy-eggs'] },
      { name: 'Cheddar Cheese 400g', description: 'Aged mature cheddar block', price: 5.99, imageUrl: 'https://picsum.photos/seed/cheddar-block/400/400', stock: 30, categoryId: catMap['dairy-eggs'] },

      // Bakery
      { name: 'Sourdough Loaf', description: 'Freshly baked artisan sourdough', price: 4.99, imageUrl: 'https://picsum.photos/seed/sourdough-loaf/400/400', stock: 20, categoryId: catMap['bakery'] },
      { name: 'Butter Croissants × 4', description: 'Flaky golden butter croissants', price: 3.49, imageUrl: 'https://picsum.photos/seed/butter-croissants/400/400', stock: 15, categoryId: catMap['bakery'] },
      { name: 'Blueberry Muffins × 2', description: 'Moist muffins bursting with blueberries', price: 2.99, imageUrl: 'https://picsum.photos/seed/blueberry-muffins/400/400', stock: 20, categoryId: catMap['bakery'] },

      // Beverages
      { name: 'Orange Juice 1L', description: 'Not-from-concentrate fresh orange juice', price: 3.49, imageUrl: 'https://picsum.photos/seed/orange-juice-1l/400/400', stock: 50, categoryId: catMap['beverages'] },
      { name: 'Sparkling Water × 6', description: 'Natural sparkling mineral water cans', price: 2.99, imageUrl: 'https://picsum.photos/seed/sparkling-water-6/400/400', stock: 40, categoryId: catMap['beverages'] },
      { name: 'Cold Brew Coffee 500ml', description: 'Smooth 24-hour cold brew concentrate', price: 5.99, imageUrl: 'https://picsum.photos/seed/cold-brew-bottle/400/400', stock: 25, categoryId: catMap['beverages'] },

      // Snacks
      { name: 'Mixed Nuts 200g', description: 'Premium roasted and lightly salted mixed nuts', price: 5.49, imageUrl: 'https://picsum.photos/seed/mixed-nuts-bag/400/400', stock: 35, categoryId: catMap['snacks'] },
      { name: 'Dark Chocolate 100g', description: '70% cocoa dark chocolate bar', price: 2.49, imageUrl: 'https://picsum.photos/seed/dark-choc-bar/400/400', stock: 45, categoryId: catMap['snacks'] },
      { name: 'Kettle Chips 150g', description: 'Hand-cooked salted kettle potato chips', price: 2.99, imageUrl: 'https://picsum.photos/seed/kettle-chips-bag/400/400', stock: 40, categoryId: catMap['snacks'] },
    ]

    await prisma.product.createMany({ data: products })
    console.log(`Created ${products.length} products`)
  } else {
    console.log('Products already exist, skipping')
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
