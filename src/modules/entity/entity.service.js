import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../constants.js'
import { postRelationDeleteByFromPostId } from '../post/postRelation.service.js'

const { ENTITY } = SYSTEM_IDS

/**
 * Creates post & postHistory & postMetadata
 * @param {PrismaClient} prisma
 * @param {{ userId: string, data: {title: string, language: string | undefined, content: string}, mentions: string[] }}
 */
export async function createEntity (prisma, { userId, data, mentions }) {
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

/**
 * @param {PrismaClient} prisma
 */
export async function updateEntity (prisma, { post, outRelations, systemRelations }) {
  await postRelationDeleteByFromPostId(prisma, post.id)

  await prisma.post.update({
    where: {
      id: post.id
    },
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: SYSTEM_IDS.ENTITY
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
