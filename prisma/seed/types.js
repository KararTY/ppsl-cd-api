import { PrismaClient } from '../../.prisma/client/index.js'
import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../src/schemas.js'

const { BIO, SYSTEM, ENTITY } = SYSTEM_IDS
const defaultContent = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"This is a system entity.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'

const prisma = new PrismaClient()

async function main () {
  const sysUser = await prisma.user.upsert({
    where: { email: 'system@ppsl.app' },
    update: {},
    create: {
      email: 'system@ppsl.app',
      name: '%s [PPSL] System //\\\\',
      id: SYSTEM
    }
  })

  const sysPost = await prisma.post.upsert({
    where: { id: SYSTEM },
    update: {},
    create: {
      id: SYSTEM,
      postHistory: {
        create: {
          title: 'System',
          content: defaultContent,
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          postMetadata: {
            create: {
              user: {
                connect: {
                  id: sysUser.id
                }
              }
            }
          }
        }
      }
    }
  })

  await prisma.post.upsert({
    where: { id: BIO },
    update: {},
    create: {
      id: BIO,
      outRelations: {
        create: {
          isSystem: true,
          toPost: {
            connect: {
              id: sysPost.id
            }
          }
        }
      },
      postHistory: {
        create: {
          title: 'Bio',
          content: defaultContent,
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          postMetadata: {
            create: {
              user: {
                connect: {
                  id: sysUser.id
                }
              }
            }
          }
        }
      }
    }
  })

  await prisma.post.upsert({
    where: { id: ENTITY },
    update: {},
    create: {
      id: ENTITY,
      outRelations: {
        create: {
          isSystem: true,
          toPost: {
            connect: {
              id: sysPost.id
            }
          }
        }
      },
      postHistory: {
        create: {
          title: 'Entity',
          content: defaultContent,
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          postMetadata: {
            create: {
              user: {
                connect: {
                  id: sysUser.id
                }
              }
            }
          }
        }
      }
    }
  })
}

try {
  await main()
  await prisma.$disconnect()
} catch (error) {
  await prisma.$disconnect()
  console.error(error)
  process.exit(1)
}
