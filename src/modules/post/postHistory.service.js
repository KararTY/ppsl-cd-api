export const authorThroughMetadataInclude = {
  include: {
    metadata: {
      include: {
        user: {
          select: {
            name: true,
            id: true
          }
        }
      }
    }
  }
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostHistoryWhereInput} filter
 * @param {import('../../../.prisma/client').Prisma.PostHistoryInclude} include
 */
export async function allPostHistoriesPaginated (prisma, cursor, filter) {
  return await prisma.postHistory.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    where: filter,
    include: {
      metadata: {
        select: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })
}
