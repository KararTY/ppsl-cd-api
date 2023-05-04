import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'
import { encode } from '@msgpack/msgpack'
import { userCore } from '../user/user.schema'

export const postCore = z.object({
  id: z.string()
})

// Querystrings

const cursor = z.string().optional()

export const postPaginationQueries = z.object({
  cursor: cursor.describe('Usually the last result array element\'s id.')
})

// Params

export const postParamsId = z.object({
  id: z.string()
})

export const postHistoryParamsId = z.object({
  historyId: z.string()
})

// Requests

export const postsFilterRequestSchema = z.object({
  postHistory: z.object({
    every: z.object({
      metadata: z.object({
        userId: z.string()
      })
    })
  }).optional(),
  inRelations: z.object({
    some: z.object({
      fromPostId: z.string()
    })
  }).optional(),
  outRelations: z.object({
    some: z.object({
      toPostId: z.string()
    })
  }).optional()
})

// Responses
export const postHistoryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.string(),
  content: z.string().transform((string) => encode(JSON.parse(string)).toString()).describe('Encoded with @msgpack/msgpack'),
  createdTimestamp: z.date(),
  metadata: z.object({
    user: z.object({
      id: userCore.shape.id,
      name: userCore.shape.name
    })
  }).optional()
})

export const postHistoriesPaginatedResponseSchema = z.object({
  result: z.array(postHistoryResponseSchema.omit({ content: true })),
  cursor
})

export const postResponseSchema = postCore.extend({
  postHistory: z.array(z.object({
    title: z.string(),
    language: z.string(),
    createdTimestamp: z.date()
  }))
})

export const postResponseSchemaWithPostHistoryContent = postCore.extend({
  postHistory: z.array(postHistoryResponseSchema)
})

export const postsPaginatedResponseSchema = z.object({
  result: z.array(postResponseSchema),
  cursor
})

// Build

export const { schemas: postSchemas, $ref } = buildJsonSchemas({
  postsFilterRequestSchema,
  postsPaginatedResponseSchema,
  postResponseSchema,
  postResponseSchemaWithPostHistoryContent,
  postParamsId,
  postHistoryParamsId,
  postPaginationQueries,
  postHistoriesPaginatedResponseSchema
}, { $id: 'post' })

/**
 * @typedef {z.infer<typeof postCore>} PostCoreSchema
 * @typedef {z.infer<typeof postResponseSchema>} PostResponseSchema
 * @typedef {z.infer<typeof postsPaginatedResponseSchema>} PostsPaginatedResponseSchema
 */
