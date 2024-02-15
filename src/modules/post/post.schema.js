import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

export const postCore = z.object({
  id: z.string(),
  lastUpdated: z.date(),
  createdTimestamp: z.date()
})

export const yPostCore = z.object({
  id: z.string(),
  language: z.string(),
  lastUpdated: z.date(),
  createdTimestamp: z.date()
})

export const postMetadataCore = z.object({
  id: z.string(),

  userId: z.string()
})

export const postHistoryCore = z.object({
  id: z.string(),

  title: z.string(),
  language: z.string(),

  content: z.string(),

  endTimestamp: z.date(),
  createdTimestamp: z.date(),

  postMetadataId: z.string(),

  post: postCore.partial().optional(),
  postId: postCore.shape.id
})

export const yPostUpdateCore = z.object({
  id: z.string(),
  title: z.string(),

  content: z.string(),

  metadataId: z.string(),

  post: yPostCore.partial().optional(),
  postId: yPostCore.shape.id,

  createdTimestamp: z.date()
})

const outRelations = z.array(z.object({
  isSystem: z.boolean(),
  toPostId: z.string(),
  toPost: yPostCore.partial().extend({
    postUpdates: z.array(yPostUpdateCore.pick({ title: true }))
  })
}))

export const postHistoryWithPostMetadata = postHistoryCore.extend({
  postMetadata: postMetadataCore
})

export const postMetadataWithPostHistory = postMetadataCore.extend({
  postHistory: postHistoryCore
})

export const postHistoryEssentials = z.object({
  title: z.string().optional(),
  language: z.string().optional().default('en'),
  content: z.string()
})

const WhereStringFilters = z.object({
  equals: z.string(),
  not: z.string(),
  startsWith: z.string(),
  mode: z.enum(['insensitive'])
})

const WhereStringFiltersUnion = z.union([z.string(), WhereStringFilters.partial()])

const WhereBoolFilters = z.object({
  equals: z.boolean(),
  not: z.boolean()
})

const WhereBoolFiltersUnion = z.union([z.boolean(), WhereBoolFilters.partial()])

const WhereOptions = z.object({
  id: WhereStringFiltersUnion.optional(),
  postHistory: z.object({
    every: z.object({
      postMetadata: z.object({
        userId: z.string()
      })
    }),
    some: z.object({
      title: WhereStringFiltersUnion.optional(),
      language: postHistoryCore.shape.language,
      postId: postHistoryCore.shape.postId
    }).partial()
  }).partial(),
  inRelations: z.object({
    some: z.object({
      isSystem: WhereBoolFiltersUnion.optional(),
      fromPostId: WhereStringFiltersUnion.optional()
    })
  }),
  outRelations: z.object({
    some: z.object({
      isSystem: WhereBoolFiltersUnion.optional(),
      toPostId: WhereStringFiltersUnion.optional()
    })
  })
})

const ReviewTypes = z.enum(['NEUTRAL', 'NEGATIVE', 'POSITIVE'])

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
  AND: z.array(WhereOptions.partial())
}).merge(WhereOptions).partial()

export const postReviewAddRequestSchema = postHistoryEssentials.required().merge(z.object({ type: ReviewTypes }))

// Responses

export const postReviewResponseSchema = z.object({
  id: z.string(),
  type: ReviewTypes,
  userId: z.string(),
  fromPost: postCore.partial().extend({
    postHistory: z.array(postHistoryCore.pick({ content: true, title: true, language: true }))
  }).optional(),
  toPostId: z.string()
})

export const postResponseSchema = postCore.partial().extend({
  postHistory: z.array(postHistoryCore.pick({
    title: true,
    language: true,
    createdTimestamp: true
  }))
})

export const postWithPostHistoryContentAndOutRelationsResponseSchema = postCore.partial().extend({
  postHistory: z.array(postHistoryCore),
  outRelations: z.array(z.object({
    isSystem: z.boolean(),
    toPost: postCore.partial().extend({
      postHistory: z.array(postHistoryCore.pick({ language: true, title: true }))
    })
  })),
  reviewing: z.union([z.null(), z.object({
    toPost: postCore.pick({ id: true }).extend({
      postHistory: z.array(postHistoryCore.pick({ language: true, title: true }))
    }),
    type: postReviewResponseSchema.shape.type
  })])
})

export const yPostWithOutRelationsAndLatestYPostUpdate = yPostCore.partial().extend({
  postUpdates: z.array(yPostUpdateCore.pick({ title: true, id: true, createdTimestamp: true })),
  outRelations
})

export const getPostByIdResponseSchema = z.object({
  post: yPostWithOutRelationsAndLatestYPostUpdate,
  update: z.string()
})

export const postHistoryResponseSchema = postHistoryCore

export const postUpdateResponse = postCore.extend({
  postHistory: postHistoryCore.pick({ id: true, language: true, title: true, createdTimestamp: true })
})

// Pagination responses

export const postsPaginatedResponseSchema = z.object({
  result: z.array(postResponseSchema),
  cursor,
  count: z.number()
})

export const postHistoriesPaginatedResponseSchema = z.object({
  result: z.array(postHistoryResponseSchema.omit({ content: true })),
  cursor
})

export const postReviewsPaginatedResponseSchema = z.object({
  result: z.array(postReviewResponseSchema.merge(z.object({
    user: z.object({ name: z.string() })
  }))),
  cursor,
  count: z.number()
})

// Build

export const { schemas: postSchemas, $ref } = buildJsonSchemas({
  postsFilterRequestSchema,
  postReviewAddRequestSchema,

  postResponseSchema,
  postWithPostHistoryContentAndOutRelationsResponseSchema,
  getPostByIdResponseSchema,
  postReviewResponseSchema,

  postParamsId,
  postHistoryParamsId,
  postPaginationQueries,

  postsPaginatedResponseSchema,
  postHistoriesPaginatedResponseSchema,
  postReviewsPaginatedResponseSchema
}, { $id: 'post' })

/**
 * @typedef {z.infer<typeof postCore>} PostCoreSchema
 * @typedef {z.infer<typeof postResponseSchema>} PostResponseSchema
 * @typedef {z.infer<typeof postsPaginatedResponseSchema>} PostsPaginatedResponseSchema
 */
