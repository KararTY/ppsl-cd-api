import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { postYRelationDeleteByFromPostId } from '../postRelation/postRelation.service.js'

const { ENTITY } = SYSTEM_IDS

/**
 * Creates yFolder & yPost & yPostUpdate & yPostUpdateMetadata
 * @param {PrismaClient} prisma
 * @param {{ data: { title: string, content: string }, language?: string, mentions: string[] }}
 * @param {{ user: { name: string, id: string }, byteLength: number }} metadata
 */
export async function createEntity (prisma, { data, language, mentions }, metadata) {
  const outRelations = mentions.map((mentionPostId) => ({ isSystem: false, toPostId: mentionPostId }))

  const { user, byteLength } = metadata

  const { id, lang, postUpdate } = await prisma.$transaction(async (tx) => {
    // Create yFolder
    const { id: folderId } = await tx.yFolder.create({
      data: {}
    })

    // Create yPost
    const { id: yPostId, language: lang } = await tx.yPost.create({
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
        },
        // Update's byteLength is the initial total byteLength on creation.
        totalByteLength: metadata.byteLength
      },
      select: {
        id: true,
        language: true
      },
      // @ts-ignore
      _metadata: {
        user,
        byteLength
      }
    })

    // Create yPostUpdateMetadata & yPostUpdate
    const postUpdate = await tx.yPostUpdateMetadata.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        byteLength,
        postUpdate: {
          create: {
            ...data,
            post: {
              connect: {
                id: yPostId // IMPORTANT
              }
            }
          }
        }
      }
    }).postUpdate()

    return { id: yPostId, lang, postUpdate }
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
