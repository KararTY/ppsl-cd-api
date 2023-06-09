import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

import { postHistoryCore, postHistoryEssentials } from '../post/post.schema.js'

// Core

export const userCore = z.object({
  id: z.string(),
  name: z.string().nonempty(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional()
})

export const userCorePublic = userCore.omit({ email: true })

// Requests

export const userProfileBioUpdateSchema = postHistoryEssentials

// Responses

export const userSessionResponseSchema = z.object({
  user: userCore
})

export const userProfileResponseSchema = userCorePublic.extend({
  bio: postHistoryCore.pick({ title: true, language: true, content: true, postId: true, createdTimestamp: true }).optional()
})

export const usersOnlyNameAndIdResponseSchema = z.array(userCore.pick({ name: true, id: true }))

// Build

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  userProfileBioUpdateSchema,
  userSessionResponseSchema,
  userProfileResponseSchema,
  usersOnlyNameAndIdResponseSchema
}, { $id: 'user' })

// Used for IDE typings
const userSessionSchema = userCore // eslint-disable-line

/**
 * @typedef {z.infer<typeof userCore>} UserCoreSchema
 * @typedef {z.infer<typeof userSessionSchema>} UserSessionSchema
 * @typedef {z.infer<typeof userProfileResponseSchema>} UserProfileResponseSchema
 */
