import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../constants.js'
import { updatePostHistoryEndTimestampByCompoundUniqueId } from '../post/postHistory.service.js'

/**
 * @param {PrismaClient} prisma
 * @param {PrismaTypes.User} user
 */
export async function createDefaultBioPost (prisma, user) {
  return await prisma.post.create({
    data: {
      outRelations: {
        create: {
          isSystem: true,
          toPost: {
            connect: {
              id: SYSTEM_IDS.BIO
            }
          }
        }
      },
      postHistory: {
        create: {
          title: 'Bio',
          content: '',
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          postMetadata: {
            create: {
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          }
        }
      }
    }
  })
}

/**
 * Creates postHistory & postMetadata based on postHistory.postId
 * @param {PrismaClient} prisma
 * @param {{ id: string, postId: string }} postHistory
 * @param {{ title: string, language: string | undefined, content: string }} data
 */
export async function createBio (prisma, userId, postHistory, data) {
  // Create new postMetadata, & postHistory with temporary endTimestamp
  const newPostHistory = await prisma.postMetadata.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      postHistory: {
        create: {
          ...data,
          endTimestamp: new Date(105000),
          post: {
            connect: {
              id: postHistory.postId // IMPORTANT
            }
          }
        }
      }
    }
  }).postHistory()

  // Add endTimestamp on previous postHistory.
  await updatePostHistoryEndTimestampByCompoundUniqueId(prisma, {
    endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
    language: data.language || 'en',
    postId: postHistory.postId
  }, new Date())

  // Enable new postHistory.
  await prisma.postHistory.update({
    where: {
      id: newPostHistory.id
    },
    data: {
      endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals
    }
  })

  // TODO: Recalculate relations, by postHistory.postId.

  return { postHistory: { id: newPostHistory.id, postId: newPostHistory.postId, title: newPostHistory.title, language: newPostHistory.language } }
}
