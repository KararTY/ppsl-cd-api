import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { postRelationDeleteByFromPostId, postYRelationDeleteByFromPostId } from '../post/postRelation.service.js'

const { ENTITY } = SYSTEM_IDS

/**
 * Creates yFolder & yPost & yPostUpdate & yPostUpdateMetadata
 * @param {PrismaClient} prisma
 * @param {{ userId: string, language?: string, data: {title: string, content: string}, mentions: string[] }}
 */
export async function createYEntity (prisma, { userId, language, data, mentions }) {
  const outRelations = mentions.map((mentionPostId) => ({ isSystem: false, toPostId: mentionPostId }))

  const { id, lang, postUpdate } = await prisma.$transaction(async (tx) => {
    // Create yFolder
    const { id: folderId } = await tx.yFolder.create({
      data: {}
    })

    // Create yPost
    const { id, language: lang } = await tx.yPost.create({
      data: {
        language,
        yFolder: {
          connect: {
            id: folderId
          }
        },
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

    // Create yPostUpdateMetadata & yPostUpdate
    const postUpdate = await tx.yPostUpdateMetadata.create({
      data: {
        user: {
          connect: {
            id: userId
          }
        },
        postUpdate: {
          create: {
            ...data,
            post: {
              connect: {
                id // IMPORTANT
              }
            }
          }
        }
      }
    }).postUpdate()

    return { id, lang, postUpdate }
  })

  return {
    id,
    language: lang,
    postUpdate: {
      id: postUpdate.id,
      title: postUpdate.title
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

/**
 * @param {PrismaClient} prisma
 * @param {{ post: { id: string } }}
 */
export async function updateYEntity (prisma, { post, outRelations, systemRelations }) {
  return await prisma.$transaction(async (tx) => {
    await postYRelationDeleteByFromPostId(tx, post.id)

    await tx.yPost.update({
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
  })
}
