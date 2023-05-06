import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../schemas'

/**
 * @param {PrismaClient} prisma
 */
export async function userById (prisma, id) {
  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}

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
