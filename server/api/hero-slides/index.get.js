export default defineEventHandler(async () => {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
  })
})
