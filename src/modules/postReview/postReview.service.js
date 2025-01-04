import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { postRelationDeleteByFromPostId } from '../postRelation/postRelation.service.js'

const { REVIEW } = SYSTEM_IDS

/**
 * @param {PrismaClient} prisma
 */
export async function createReview (prisma, { userId, type, toPostId, outRelations }) {
  const { id } = await prisma.post.create({
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: REVIEW
            },
            ...outRelations
          ],
          skipDuplicates: true
        }
      }
    }
  })

  await prisma.postReview.create({
    data: {
      type: type || 'NEUTRAL',
      user: {
        connect: {
          id: userId
        }
      },
      fromPost: {
        connect: {
          id
        }
      },
      toPost: {
        connect: {
          id: toPostId
        }
      }
    }
  })

  return id
}

/**
 * @param {PrismaClient} prisma
 */
export async function updateReview (prisma, { review, postId, type, outRelations, systemRelations }) {
  await prisma.postReview.update({
    where: {
      id: review.id
    },
    data: {
      type
    }
  })

  await postRelationDeleteByFromPostId(prisma, postId)

  await prisma.post.update({
    where: {
      id: postId
    },
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: REVIEW
            },
            ...systemRelations,
            ...outRelations
          ],
          skipDuplicates: true
        }
      },
      lastUpdated: new Date()
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {string} postId
 */
export async function allReviewsForPostIdPaginated (prisma, postId, cursor) {
  const [postReviews, count] = await prisma.$transaction([
    prisma.postReview.findMany({
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
    }),
    prisma.postReview.count({ where: { toPostId: postId } })
  ])

  return { postReviews, count }
}

/**
 * @param {PrismaClient} prisma
 * @param {string} userId
 * @param {{ fromPostId?: string, toPostId?: string }}
 */
export async function reviewByUserIdAndToPostId (prisma, userId, { fromPostId, toPostId }) {
  return prisma.postReview.findFirst({
    where: {
      toPostId,
      fromPostId,
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
              id: true,
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
