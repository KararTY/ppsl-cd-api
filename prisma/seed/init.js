import { PrismaClient } from '../../.prisma/client/index.js'
import { ACTIVE_POSTHISTORY_WHERE, SYSTEM_IDS } from '../../src/schemas.js'

const { BIO } = SYSTEM_IDS

const prisma = new PrismaClient()

async function main () {
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
      postHistory: {
        create: {
          title: 'Test bio [EXAMPLE]',
          content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bio b-b-b-bio.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
          postMetadata: {
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
              id: BIO
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
