import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

export const postCore = z.object({
  id: z.string(),
  title: z.string(),
  language: z.string()
})

const postCoreRequest = postCore.omit({
  id: true
})

export const postResponseSchema = postCore

export const postRequestSchema = postCoreRequest

export const allPostsResponseSchema = z.object({
  result: z.array(postCore),
  cursor: z.string().optional()
})

export const { schemas: postSchemas, $ref } = buildJsonSchemas({
  postResponseSchema,
  postRequestSchema,
  allPostsResponseSchema
}, { $id: 'post' })

/**
 * @typedef {z.infer<typeof postCore>} PostCoreSchema
 * @typedef {z.infer<typeof postResponseSchema>} PostResponseSchema
 * @typedef {z.infer<typeof postRequestSchema>} PostRequestSchema
 * @typedef {z.infer<typeof allPostsResponseSchema>} AllPostsResponseSchema
 */
