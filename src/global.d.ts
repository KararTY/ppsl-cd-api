import { FastifyInstance as Instance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify'

import { Post, PostHistory, PostMetadata, PostRelation, User, PostReview, PostReviewTypes } from '../.prisma/client'

declare global {
  export namespace Fastify {
    export { Instance, Reply, Request }
  }
}

declare global {
  export type PrismaClient = import('../.prisma/client').PrismaClient

  export namespace PrismaTypes {
    export { Post, PostHistory, PostMetadata, PostRelation, User, PostReview, PostReviewTypes }
  }
}
