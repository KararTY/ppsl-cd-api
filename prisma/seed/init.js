import { PrismaClient } from '../../.prisma/client/index.js'

const prisma = new PrismaClient()

const defaultContent = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"This is a system entity.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'

async function main () {
  const sysUser = await prisma.user.upsert({
    where: { email: 'system@ppsl.app' },
    update: {},
    create: {
      email: 'system@ppsl.app',
      name: '%s [PPSL] System //\\\\',
      id: 'system'
    }
  })

  const sysPost = await prisma.post.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      title: 'System',
      id: 'system',
      postHistory: {
        create: {
          title: 'System',
          content: defaultContent,
          metadata: {
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

  const sysBioPost = await prisma.post.upsert({
    where: { id: 'bio' },
    update: {},
    create: {
      title: 'Bio',
      id: 'bio',
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
          metadata: {
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

  const testUser = await prisma.user.upsert({
    where: { email: 'test.user@example.com' },
    update: {},
    create: {
      id: 'test-user',
      email: 'test.user@example.com',
      name: 'Test User [EXAMPLE]'
    }
  })

  await prisma.post.upsert({
    where: { id: 'test-post' },
    update: {},
    create: {
      id: 'test-post',
      title: 'Test bio [EXAMPLE]',
      postHistory: {
        create: {
          title: 'Test bio [EXAMPLE]',
          content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bio b-b-b-bio.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          metadata: {
            create: {
              user: {
                connect: {
                  id: testUser.id
                }
              }
            }
          }
        }
      },
      outRelations: {
        create: {
          isSystem: true,
          toPost: {
            connect: {
              id: sysBioPost.id
            }
          }
        }
      }
    }
  })
}

main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  await prisma.$disconnect()
  console.error(e)
  process.exit(1)
})
