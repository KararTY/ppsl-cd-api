import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const postCore = z.object({
  id: z.string(),
  postId: z.string(),

  language: z.string(),
  timestamp: z.date(),

  title: z.string(),
  content: z.string()
})

const postCoreRequest = postCore.omit({
  id: true,
  postId: true
})

export const postResponseSchema = postCore

export const postRequestSchema = postCoreRequest

export const allPostsResponseSchema = z.object({
  result: z.array(postCore),
  cursor: z.number().optional()
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
