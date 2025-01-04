import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'

const { BIO } = SYSTEM_IDS

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
              id: BIO
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
