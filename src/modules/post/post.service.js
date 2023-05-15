import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'

/**
 * @type {import('../../../.prisma/client).Prisma.PostInclude}
 */
export const activePostHistoryInclude = {
  postHistory: {
    where: ACTIVE_POSTHISTORY_WHERE,
    take: 1
  }
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostWhereInput} filter
 * @param {import('../../../.prisma/client').Prisma.PostInclude} include
 */
export async function allPostsPaginated (prisma, cursor, filter) {
  return await prisma.post.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    where: filter,
    include: activePostHistoryInclude,
    orderBy: {
      createdTimestamp: 'desc'
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postWithContentById (prisma, id) {
  return await prisma.post.findFirst({
    where: {
      id
    },
    include: {
      outRelations: {
        select: {
          toPost: {
            select: {
              id: true,
              postHistory: {
                select: {
                  title: true,
                  language: true
                },
                where: activePostHistoryInclude.postHistory.where,
                take: 1
              }
            }
          },
          isSystem: true
        }
      },
      postHistory: activePostHistoryInclude.postHistory
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postWithSystemRelationsById (prisma, id) {
  return await prisma.post.findFirst({
    where: {
      id
    },
    include: {
      outRelations: {
        select: {
          isSystem: true,
          toPostId: true,
          toPost: {
            select: {
              postHistory: {
                select: {
                  title: true,
                  language: true
                }
              }
            }
          }
        },
        where: {
          isSystem: true
        }
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function updatePostLastUpdatedById (prisma, id, newLastUpdated) {
  const { lastUpdated } = await prisma.post.update({
    where: {
      id
    },
    data: {
      lastUpdated: newLastUpdated
    }
  })

  return lastUpdated
}
