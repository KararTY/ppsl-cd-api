import { z } from 'zod'
import { postCore } from '../post/post.schema'
import { userCore, userCorePublic } from '../user/user.schema'
import { buildJsonSchemas } from 'fastify-zod'

const metadataCore = z.object({
  id: z.string(),

  post: postCore,
  postId: postCore.shape.postId,

  user: userCorePublic.optional(),
  userId: userCore.shape.id
})

export const metadataResponseSchema = metadataCore

export const { schemas: metadataSchemas, $ref } = buildJsonSchemas({
  metadataResponseSchema
}, { $id: 'metadata' })
