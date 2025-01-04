import { PrismaClient } from '../../../.prisma/client/index.js' // Generated with prisma:generate

const p = new PrismaClient()

/**
 * @type {PrismaClient}
 */
const prisma = /** @type {any} */ (
  p.$extends({
    query: {
      user: {
        async create ({ query, args }) {
          // _emit('user:create', { name: args.data.name })
          return query(args)
        }
      },
      yPost: {
        async create ({ query, args }) {
          // @ts-ignore
          // const { user } = args._metadata
          // _emit('article:create', {
          //   title: args.data.title,
          //   rawTitle: args.data.rawTitle,
          //   createdTimestamp:
          //     args.data.createdTimestamp?.toString() || new Date().toString(),
          //   author: user.name
          // })

          // @ts-ignore
          delete args._metadata
          return query(args)
        }
        // See "src/routes/api/article/update/[title]/+server.js" for "article:update".
      }
    }
  })
)

export { prisma }
