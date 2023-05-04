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

// Requests

export const postsFilterRequestSchema = z.object({
  postHistory: z.object({
    every: z.object({
      metadata: z.object({
        userId: z.object({
          equals: z.string()
        })
      })
    })
  }).optional(),
  inRelations: z.object({
    some: z.object({
      fromPostId: z.object({
        equals: z.string()
      })
    })
  }).optional(),
  outRelations: z.object({
    some: z.object({
      toPostId: z.object({
        equals: z.string()
      })
    })
  }).optional()
})

export const postRequestSchema = postCoreRequest

// Responses

export const postResponseSchema = postCore.extend({
  postHistory: z.array(z.object({
    title: z.string(),
    content: z.string(),
    createdTimestamp: z.date()
  }))
})

export const allPostsResponseSchema = z.object({
  result: z.array(postCore),
  cursor: z.string().optional()
})

// Build

export const { schemas: postSchemas, $ref } = buildJsonSchemas({
  postsFilterRequestSchema,
  postRequestSchema,
  allPostsResponseSchema,
  postResponseSchema
}, { $id: 'post' })

/**
 * @typedef {z.infer<typeof postCore>} PostCoreSchema
 * @typedef {z.infer<typeof postResponseSchema>} PostResponseSchema
 * @typedef {z.infer<typeof postRequestSchema>} PostRequestSchema
 * @typedef {z.infer<typeof allPostsResponseSchema>} AllPostsResponseSchema
 */
