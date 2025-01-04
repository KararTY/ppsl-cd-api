/**
 * @param {PrismaClient} prisma
 */
export async function allYPostsPaginated (prisma, cursor, filter) {
  const [posts, count] = await prisma.$transaction([
    prisma.yPost.findMany({
      take: 50,
      skip: cursor ? 1 : undefined,
      cursor: cursor
        ? {
            id: cursor
          }
        : undefined,
      where: filter,
      include: {
        postUpdates: {
          orderBy: {
            createdTimestamp: 'desc'
          },
          select: {
            title: true,
            createdTimestamp: true
          },
          take: 1
        },
        _count: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    }),
    prisma.yPost.count({ where: filter })
  ])

  return { posts, count }
}

/**
 * @param {PrismaClient} prisma
 * @param {string} id
 */
export async function yPostWithContentById (prisma, id) {
  return prisma.yPost.findFirst({
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
      postUpdates: true
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
 * @param {string} postId
 */
export async function yPostWithLatestPostUpdateTitle (prisma, postId) {
  return prisma.yPost.findFirst({
    where: {
      id: postId
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
        orderBy: {
          createdTimestamp: 'desc'
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

/**
 * @param {PrismaClient} prisma
 * @param {string} postId
 * @param {string} content
 */
export const upsertHTML = (prisma, postId, content) => {
  return prisma.html.upsert({
    where: {
      postId
    },
    create: {
      postId,
      content
    },
    update: {
      content
    }
  })
}
