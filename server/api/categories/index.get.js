export default defineEventHandler(async () => {
  return await prisma.category.findMany({
    orderBy: [{ isTrending: 'desc' }, { name: 'asc' }],
  })
})
