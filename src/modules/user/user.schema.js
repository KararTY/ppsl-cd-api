import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const userCore = z.object({
  name: z.string().nonempty(),
  email: z.string().email().optional(),
  image: z.string().optional()
})

export const userResponseSchema = z.object({
  user: userCore
})

export const userUnauthenticatedResponseSchema = z.object({
  error: z.string()
})

export const { schemas: userSchemas, $ref: $userSchemasRef } = buildJsonSchemas({
  userResponseSchema,
  userUnauthenticatedResponseSchema
})

/**
 * @typedef {z.infer<typeof userCore>} UserCoreSchema
 * @typedef {z.infer<typeof userResponseSchema>} UserResponseSchema
 * @typedef {z.infer<typeof userUnauthenticatedResponseSchema>} UserUnauthenticatedResponseSchema
 */
