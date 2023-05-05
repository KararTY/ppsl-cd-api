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
              id: 'bio'
            }
          }
        }
      },
      postHistory: {
        create: {
          title: 'Bio',
          content: '',
          metadata: {
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
