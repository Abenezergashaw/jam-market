export default defineEventHandler(async (event) => {
  requireCashier(event, null)

  const count = await prisma.conversation.count({
    where: {
      messages: {
        some: { senderRole: 'customer', readAt: null },
      },
    },
  })

  return { count }
})
