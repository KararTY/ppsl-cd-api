import fp from 'fastify-plugin'

import { userSchemas } from './modules/user/user.schema.js'
import { postSchemas } from './modules/post/post.schema.js'

/**
 * @type {import('fastify').FastifyPluginAsync}
 */
const schemas = fp(async (fastify) => {
  for (const schema of [...userSchemas, ...postSchemas]) {
    await fastify.addSchema(schema)
  }
})

export default schemas

export const SYSTEM_IDS = {
  SYSTEM: 'system',

  BIO: 'bio',
  ENTITY: 'entity',
  REVIEW: 'review'
}

export const ACTIVE_POSTHISTORY_WHERE = {
  endTimestamp: {
    equals: new Date(0)
  }
}
