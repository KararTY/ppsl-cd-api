import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../constants.js'

/**
 * @param {PrismaClient} prisma
 */
export async function userById (prisma, id) {
  return await prisma.user.findUnique({
    where: {
      id
    },
    include: {
      postsMetadata: {
        where: {
          postHistory: {
            endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp,
            post: {
              outRelations: {
                some: {
                  isSystem: true,
                  toPostId: SYSTEM_IDS.BIO
                }
              }
            }
          }
        },
        select: {
          postHistory: {
            select: {
              id: true,
              title: true,
              content: true,
              createdTimestamp: true,
              postId: true
            }
          }
        },
        take: 1
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
// export async function userPostsMetadata (prisma, id) {
//   return await prisma.user.findUnique({
//     where: {
//       id
//     }
//   }).postsMetadata({
//     select: {
//       postHistory: {
//         select: {
//           post: {
//             select: {
//               id: true,
//               title: true,
//               language: true
//             }
//           }
//         }
//       }
//     }
//   })
// }

/**
 * @param {PrismaClient} prisma
 */
export async function userAuthorByPostHistoryId (prisma, postHistoryId) {
  return await prisma.user.findFirst({
    where: {
      postsMetadata: {
        some: {
          postHistory: {
            id: postHistoryId
          }
        }
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postAuthors (prisma, id) {
  return await prisma.user.findMany({
    where: {
      postsMetadata: {
        some: {
          postHistory: {
            postId: id
          }
        }
      }
    },
    select: {
      id: true,
      name: true
    }
  })
}
