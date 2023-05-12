import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'
import { encode } from '@msgpack/msgpack'

export const postCore = z.object({
  id: z.string()
})

export const postMetadataCore = z.object({
  id: z.string(),

  userId: z.string()
})

export const postHistoryCore = z.object({
  id: z.string(),

  title: z.string(),
  language: z.string(),

  // Due to transform, this, and anything that uses it, must use this schema on the res object.
  content: z.string().transform((content) => {
    try {
      return encode(JSON.parse(content)).toString()
    } catch (error) {
      return content
    }
  }).describe('Encoded with @msgpack/msgpack'),

  endTimestamp: z.date(),
  createdTimestamp: z.date(),

  postMetadataId: z.string(),

  post: postCore.optional(),
  postId: postCore.shape.id
})

export const postHistoryWithPostMetadata = postHistoryCore.extend({
  postMetadata: postMetadataCore
})

export const postMetadataWithPostHistory = postMetadataCore.extend({
  postHistory: postHistoryCore
})

const WhereFilters = z.object({
  equals: z.string(),
  not: z.string(),
  startsWith: z.string(),
  mode: z.enum(['insensitive'])
})

// Querystrings

export const cursor = z.string().optional()

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
      postMetadata: z.object({
        userId: z.string()
      })
    }),
    some: z.object({
      title: z.union([z.string(), WhereFilters.partial()]),
      language: postHistoryCore.shape.language,
      postId: postHistoryCore.shape.postId
    }).partial()
  }).partial(),
  inRelations: z.object({
    some: z.object({
      fromPostId: z.union([z.string(), WhereFilters.partial()])
    })
  }),
  outRelations: z.object({
    some: z.object({
      toPostId: z.union([z.string(), WhereFilters.partial()])
    })
  })
}).partial()

// Responses

export const postResponseSchema = postCore.extend({
  postHistory: z.array(postHistoryCore.pick({
    title: true,
    language: true,
    createdTimestamp: true
  }))
})

export const postResponseWithPostHistoryContentSchema = postCore.extend({
  postHistory: z.array(postHistoryCore)
})

export const postsPaginatedResponseSchema = z.object({
  result: z.array(postResponseSchema),
  cursor
})

export const postHistoryResponseSchema = postHistoryCore

export const postHistoriesPaginatedResponseSchema = z.object({
  result: z.array(postHistoryResponseSchema.omit({ content: true })),
  cursor
})

// Build

export const { schemas: postSchemas, $ref } = buildJsonSchemas({
  postsFilterRequestSchema,
  postsPaginatedResponseSchema,
  postResponseSchema,
  postResponseWithPostHistoryContentSchema,

  postParamsId,
  postPaginationQueries,

  postHistoryParamsId,
  postHistoriesPaginatedResponseSchema
}, { $id: 'post' })

/**
 * @typedef {z.infer<typeof postCore>} PostCoreSchema
 * @typedef {z.infer<typeof postResponseSchema>} PostResponseSchema
 * @typedef {z.infer<typeof postsPaginatedResponseSchema>} PostsPaginatedResponseSchema
 */
