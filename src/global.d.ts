import { FastifyInstance as Instance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify'

import {
	User, Post, PostHistory, PostMetadata, PostRelation, PostReview, PostReviewTypes,
	YFolder, YPost, YPostRelation, YPostUpdate, YPostUpdateMetadata
} from '../.prisma/client'

declare global {
	export namespace Fastify {
		export { Instance, Reply, Request }
	}
}

declare global {
	export type PrismaClient = import('../.prisma/client').PrismaClient

	export namespace PrismaTypes {
		export {
			User, Post, PostHistory, PostMetadata, PostRelation, PostReview, PostReviewTypes,
			YFolder, YPost, YPostRelation, YPostUpdate, YPostUpdateMetadata
		}
	}
}
