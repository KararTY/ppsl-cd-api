import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../constants.js'

const { ENTITY } = SYSTEM_IDS

/**
 * Creates post & postHistory & postMetadata
 * @param {PrismaClient} prisma
 * @param {{ title: string, language: string | undefined, content: string }} data
 * @param {string[]} mentions
 */
export async function createEntity (prisma, userId, data, mentions) {
  const outRelations = mentions.map((mentionPostId) => ({ isSystem: false, toPostId: mentionPostId }))

  const { id } = await prisma.post.create({
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: ENTITY
            },
            ...outRelations
          ],
          skipDuplicates: true
        }
      }
    }
  })

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
          ...data,
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          post: {
            connect: {
              id // IMPORTANT
            }
          }
        }
      }
    }
  }).postHistory()

  return {
    id,
    postHistory: {
      id: postHistory.id,
      title: postHistory.title,
      language: postHistory.language
    }
  }
}
