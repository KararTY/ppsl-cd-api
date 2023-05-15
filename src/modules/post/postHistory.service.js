export const authorThroughMetadataInclude = {
  include: {
    postMetadata: {
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
      postMetadata: {
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

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostHistoryPostIdLanguageEndTimestampCompoundUniqueInput} postIdLanguageEndTimestamp
 */
export async function updatePostHistoryEndTimestampByCompoundUniqueId (prisma, postIdLanguageEndTimestamp, newEndTimestamp) {
  const { endTimestamp } = await prisma.postHistory.update({
    where: {
      postId_language_endTimestamp: postIdLanguageEndTimestamp
    },
    data: {
      endTimestamp: newEndTimestamp
    }
  })

  return endTimestamp
}
