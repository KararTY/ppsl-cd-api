import fp from 'fastify-plugin'

import userRoutes from './modules/user/user.route'
import postRoutes from './modules/post/post.route'

/**
 * @type {import('fastify').FastifyPluginAsync}
 */
const routes = fp(async (fastify) => {
  fastify.register(userRoutes, { prefix: 'api/users' })
  fastify.register(postRoutes, { prefix: 'api/posts' })
})

export default routes
