import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'

/**
 * @param {PrismaClient} prisma
 * @param {string} postId
 */
export async function allReviewsForPostIdPaginated (prisma, postId, cursor) {
  return prisma.postReview.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    where: {
      toPostId: postId
    },
    include: {
      user: {
        select: {
          name: true
        }
      },
      fromPost: {
        include: {
          postHistory: {
            where: {
              endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp
            },
            select: {
              title: true,
              id: true,
              language: true,
              createdTimestamp: true,
              content: true
            },
            take: 1
          }
        }
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {string} postId
 */
export async function reviewByUserIdAndPostId (prisma, userId, postId) {
  return prisma.postReview.findFirst({
    where: {
      toPostId: postId,
      userId
    },
    include: {
      fromPost: {
        include: {
          outRelations: {
            select: {
              isSystem: true,
              toPostId: true
            }
          },
          postHistory: {
            select: {
              title: true,
              content: true,
              language: true
            },
            where: {
              endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp
            }
          }
        }
      }
    }
  })
}
