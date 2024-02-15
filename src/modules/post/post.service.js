import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'

/**
 * @type {import('../../../.prisma/client').Prisma.PostInclude}
 */
export const activePostHistoryInclude = {
  postHistory: {
    where: ACTIVE_POSTHISTORY_WHERE,
    take: 1
  },
  _count: true
}

/**
 * @type {import('../../../.prisma/client').Prisma.YPostInclude}
 */
export const activeYPostUpdateInclude = {
  postUpdates: true,
  _count: true
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostWhereInput} filter
 * @param {import('../../../.prisma/client').Prisma.PostInclude} include
 */
export async function allPostsPaginated (prisma, cursor, filter) {
  const [posts, count] = await prisma.$transaction([
    prisma.post.findMany({
      take: 50,
      skip: cursor ? 1 : undefined,
      cursor: cursor
        ? {
            id: cursor
          }
        : undefined,
      where: filter,
      include: activePostHistoryInclude,
      orderBy: {
        lastUpdated: 'desc'
      }
    }),
    prisma.post.count({ where: filter })
  ])

  return { posts, count }
}

/**
 * @param {PrismaClient} prisma
 * @param {string} id
 */
export async function postWithContentById (prisma, id) {
  return await prisma.post.findFirst({
    where: {
      id
    },
    include: {
      outRelations: {
        select: {
          toPost: {
            select: {
              id: true,
              postHistory: {
                select: {
                  title: true,
                  language: true
                },
                where: activePostHistoryInclude.postHistory.where,
                take: 1
              }
            }
          },
          isSystem: true
        }
      },
      postHistory: activePostHistoryInclude.postHistory,
      reviewing: {
        select: {
          toPost: {
            select: {
              id: true,
              postHistory: {
                select: {
                  title: true,
                  language: true
                },
                where: activePostHistoryInclude.postHistory.where,
                take: 1
              }
            }
          },
          type: true
        }
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {string} id
 */
export async function yPostWithContentById (prisma, id) {
  return await prisma.yPost.findFirst({
    where: {
      id
    },
    include: {
      outRelations: {
        select: {
          toPost: {
            select: {
              language: true,
              postUpdates: {
                select: {
                  title: true
                },
                take: 1
              }
            }
          },
          toPostId: true,
          isSystem: true
        }
      },
      postUpdates: activeYPostUpdateInclude.postUpdates
      // reviewing: {
      //   select: {
      //     toPost: {
      //       select: {
      //         id: true,
      //         postHistory: {
      //           select: {
      //             title: true,
      //             language: true
      //           },
      //           where: activePostHistoryInclude.postHistory.where,
      //           take: 1
      //         }
      //       }
      //     },
      //     type: true
      //   }
      // }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {string} id
 */
export async function yPostWithLatestPostUpdateTitle (prisma, id) {
  return await prisma.yPost.findFirst({
    where: {
      id
    },
    include: {
      outRelations: {
        select: {
          toPost: {
            select: {
              language: true,
              postUpdates: {
                select: {
                  title: true
                },
                take: 1
              }
            }
          },
          toPostId: true,
          isSystem: true
        }
      },
      postUpdates: {
        select: {
          title: true,
          id: true,
          createdTimestamp: true
        },
        take: 1
      }
      // reviewing: {
      //   select: {
      //     toPost: {
      //       select: {
      //         id: true,
      //         postHistory: {
      //           select: {
      //             title: true,
      //             language: true
      //           },
      //           where: activePostHistoryInclude.postHistory.where,
      //           take: 1
      //         }
      //       }
      //     },
      //     type: true
      //   }
      // }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function updatePostLastUpdatedById (prisma, id, newLastUpdated) {
  const { lastUpdated } = await prisma.post.update({
    where: {
      id
    },
    data: {
      lastUpdated: newLastUpdated
    }
  })

  return lastUpdated
}
