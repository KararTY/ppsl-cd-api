import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants'

const { ENTITY, REVIEW, BIO } = SYSTEM_IDS

export const yPostCore = z.object({
  id: z.string(),
  language: z.string(),
  createdTimestamp: z.date()
})

export const postMetadataCore = z.object({
  id: z.string(),

  userId: z.string()
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

const outRelations = z.array(
  z.object({
    isSystem: z.boolean(),
    toPostId: z.string(),
    toPost: yPostCore.partial().extend({
      postUpdates: z.array(yPostUpdateCore.pick({ title: true }))
    })
  })
)

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

const WhereStringFiltersUnion = z.union([
  z.string(),
  WhereStringFilters.partial()
])

const WhereBoolFilters = z.object({
  equals: z.boolean(),
  not: z.boolean()
})

const WhereBoolFiltersUnion = z.union([
  z.boolean(),
  WhereBoolFilters.partial()
])

const WhereOptions = z.object({
  id: WhereStringFiltersUnion.optional(),
  postHistory: z
    .object({
      every: z.object({
        postMetadata: z.object({
          userId: z.string()
        })
      }),
      some: z
        .object({
          title: WhereStringFiltersUnion.optional(),
          language: yPostCore.shape.language,
          postId: yPostUpdateCore.shape.postId
        })
        .partial()
    })
    .partial(),
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
  cursor: cursor.describe("Usually the last result array element's id.")
})

// Params

export const postParamsId = z.object({
  id: z.string()
})

export const postHistoryParamsId = z.object({
  historyId: z.string()
})

export const initialUpdateParamsType = z.object({
  type: z.enum([ENTITY, REVIEW, BIO])
})

// Requests

export const postsFilterRequestSchema = z
  .object({
    AND: z.array(WhereOptions.partial())
  })
  .merge(WhereOptions)
  .partial()

export const postReviewAddRequestSchema = postHistoryEssentials
  .required()
  .merge(z.object({ type: ReviewTypes }))

// Responses

export const postReviewResponseSchema = z.object({
  id: z.string(),
  type: ReviewTypes,
  userId: z.string(),
  fromPost: yPostCore
    .partial()
    .extend({
      postUpdates: z.array(
        yPostUpdateCore.pick({ title: true, createdTimestamp: true })
      )
    })
    .optional(),
  toPostId: z.string()
})

export const yPostResponseSchema = yPostCore.partial().extend({
  postUpdates: z.array(
    yPostUpdateCore.pick({
      title: true,
      createdTimestamp: true
    })
  ),
  language: z.string()
})

export const yPostWithYPostUpdatesContentAndOutRelationsResponseSchema =
  yPostCore.partial().extend({
    postUpdates: z.array(yPostUpdateCore),
    outRelations: z.array(
      z.object({
        isSystem: z.boolean(),
        toPost: yPostCore.partial().extend({
          postUpdates: z.array(yPostUpdateCore.pick({ title: true }))
        })
      })
    ),
    reviewing: z.union([
      z.null(),
      z.object({
        toPost: yPostCore.pick({ id: true, language: true }).extend({
          postUpdates: z.array(
            yPostUpdateCore.pick({ title: true, createdTimestamp: true })
          )
        }),
        type: postReviewResponseSchema.shape.type
      })
    ])
  })

export const yPostWithOutRelationsAndLatestYPostUpdate = yPostCore
  .partial()
  .extend({
    postUpdates: z.array(
      yPostUpdateCore.pick({ title: true, id: true, createdTimestamp: true })
    ),
    outRelations
  })

export const getYPostByIdResponseSchema = z.object({
  post: yPostWithOutRelationsAndLatestYPostUpdate,
  html: z.string()
})

const yPostUpdateResponseSchema = yPostUpdateCore

const initialUpdateResponseSchema = z.string()

const htmlResponseSchema = z.string()

// Pagination responses

export const yPostsPaginatedResponseSchema = z.object({
  result: z.array(yPostResponseSchema),
  cursor,
  count: z.number()
})

export const yPostUpdatesPaginatedResponseSchema = z.object({
  result: z.array(yPostUpdateResponseSchema.omit({ content: true })),
  cursor
})

export const postReviewsPaginatedResponseSchema = z.object({
  result: z.array(
    postReviewResponseSchema.merge(
      z.object({
        user: z.object({ name: z.string() })
      })
    )
  ),
  cursor,
  count: z.number()
})

// Build

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  {
    postsFilterRequestSchema,
    postReviewAddRequestSchema,

    yPostResponseSchema,
    yPostWithYPostUpdatesContentAndOutRelationsResponseSchema,
    getYPostByIdResponseSchema,
    postReviewResponseSchema,
    initialUpdateResponseSchema,
    htmlResponseSchema,

    postParamsId,
    postHistoryParamsId,
    initialUpdateParamsType,

    postPaginationQueries,

    yPostsPaginatedResponseSchema,
    yPostUpdatesPaginatedResponseSchema,
    postReviewsPaginatedResponseSchema
  },
  { $id: 'post' }
)

/**
 * @typedef {z.infer<typeof yPostCore>} YPostCoreSchema
 * @typedef {z.infer<typeof yPostResponseSchema>} YPostResponseSchema
 * @typedef {z.infer<typeof yPostsPaginatedResponseSchema>} YPostsPaginatedResponseSchema
 */
