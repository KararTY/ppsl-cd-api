import fp from 'fastify-plugin'

import userRoutes from './modules/user/user.route.js'
import postRoutes from './modules/post/post.route.js'
import lexicalRoutes from './modules/lexical/lexical.route.js'

/**
 * @type {import('fastify').FastifyPluginAsync}
 */
const routes = fp(async (fastify) => {
  fastify.register(userRoutes, { prefix: 'api/users' })
  fastify.register(postRoutes, { prefix: 'api/posts' })
  fastify.register(lexicalRoutes, { prefix: 'api/lexical' })
})

export default routes
