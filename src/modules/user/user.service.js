import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'

import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'

const { BIO } = SYSTEM_IDS

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
                  toPostId: BIO
                }
              }
            }
          }
        },
        include: {
          postHistory: true
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
 * @param {string} postUpdateId
 */
export async function userAuthorByYPostUpdateId (prisma, postUpdateId) {
  return await prisma.user.findFirst({
    where: {
      yPostUpdatesMetadata: {
        some: {
          postUpdate: {
            id: postUpdateId
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
