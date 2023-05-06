import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

import { postHistoryCore } from '../post/post.schema.js'

// Core

export const userCore = z.object({
  id: z.string(),
  name: z.string().nonempty(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional()
})

export const userCorePublic = userCore.omit({ email: true })

// Requests

export const userProfileBioUpdateSchema = z.object({
  title: z.string().optional(),
  // language: z.string().optional().default('en'),
  content: z.string().describe('Encoded by @msgpack/msgpack')
})

// Responses

export const userSessionResponseSchema = z.object({
  user: userCore
})

export const userProfileResponseSchema = userCorePublic.extend({
  bio: postHistoryCore.pick({ title: true, content: true, postId: true, createdTimestamp: true }).optional()
})

// Build

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  userProfileBioUpdateSchema,
  userSessionResponseSchema,
  userProfileResponseSchema
}, { $id: 'user' })

// Used for IDE typings
const userSessionSchema = userCore // eslint-disable-line

/**
 * @typedef {z.infer<typeof userCore>} UserCoreSchema
 * @typedef {z.infer<typeof userSessionSchema>} UserSessionSchema
 * @typedef {z.infer<typeof userProfileResponseSchema>} UserProfileResponseSchema
 */
