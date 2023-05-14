import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'

/**
 * Creates postMetadata & postHistory
 * @param {PrismaClient} prisma
 * @param {{ title: string, language: string | undefined, content: string, type: PrismaTypes.PostReviewTypes }} data
 * @param {string[]} mentions
 */
export async function createReview (prisma, userId, fromPostId, toPostId, data, mentions) {
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
