import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../constants.js'
import { updatePostHistoryEndTimestampByCompoundUniqueId } from '../post/postHistory.service.js'
import { postRelationDeleteByFromPostId } from '../post/postRelation.service.js'

/**
 * Creates postMetadata & postHistory
 * @param {PrismaClient} prisma
 * @param {{ title: string, language: string | undefined, content: string, type: PrismaTypes.PostReviewTypes }} data
 * @param {string[]} mentions
 */
export async function createReviewPostHistory (prisma, userId, fromPostId, toPostId, data, mentions) {
  // Create postMetadata, & postHistory
  const postHistory = await prisma.postMetadata.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      postHistory: {
        create: {
          ...{ ...data, type: undefined },
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          post: {
            connect: {
              id: fromPostId // IMPORTANT
            }
          }
        }
      }
    }
  }).postHistory()

  return {
    id: fromPostId,
    postHistory: {
      id: postHistory.id,
      title: postHistory.title,
      language: postHistory.language
    }
  }
}

/**
 * @param {PrismaClient} prisma
 */
export async function createReview (prisma, userId, data, toPostId, outRelations) {
  const { id } = await prisma.post.create({
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: SYSTEM_IDS.REVIEW
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
      type: data.type || 'NEUTRAL',
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
export async function updateReview (prisma, review, toPostId, newData, outRelations) {
  await prisma.postReview.update({
    where: {
      id: review.id
    },
    data: {
      type: newData.type
    }
  })

  const existingSystemOutRelations = review.fromPost.outRelations.filter((relation) => relation.isSystem)

  await postRelationDeleteByFromPostId(prisma, review.fromPostId)

  await prisma.post.update({
    where: {
      id: review.fromPostId
    },
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: SYSTEM_IDS.REVIEW
            },
            ...existingSystemOutRelations,
            ...outRelations
          ],
          skipDuplicates: true
        }
      },
      lastUpdated: new Date()
    }
  })

  // Add endTimestamp on previous postHistory.
  await updatePostHistoryEndTimestampByCompoundUniqueId(prisma, {
    endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
    language: newData.language || 'en',
    postId: review.fromPostId
  }, new Date())
}
