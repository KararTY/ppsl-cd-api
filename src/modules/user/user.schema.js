import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

// Core

export const userCore = z.object({
  id: z.string(),
  name: z.string().nonempty(),
  email: z.string().email().optional(),
  image: z.string().optional()
})

export const userCorePublic = userCore.omit({ id: true, email: true })

// Requests

// Responses

export const userSessionResponseSchema = z.object({
  user: userCore.omit({ id: true })
})
export const userProfileResponseSchema = userCorePublic

// Build

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  userSessionResponseSchema,
  userProfileResponseSchema
}, { $id: 'user' })

// Used for IDE typings
const userSessionSchema = userCore.omit({ id: true }) // eslint-disable-line

/**
 * @typedef {z.infer<typeof userCore>} UserCoreSchema
 * @typedef {z.infer<typeof userSessionSchema>} UserSessionSchema
 * @typedef {z.infer<typeof userProfileResponseSchema>} UserProfileResponseSchema
 */
