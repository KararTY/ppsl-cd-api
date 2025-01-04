import { FastifyInstance as Instance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify'

import * as P from '../.prisma/client';

import * as L from 'lexical';

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
	export type PrismaTransactionClient = import('../.prisma/client').Prisma.TransactionClient

	export namespace PrismaTypes {
		export {
			User, Post, PostHistory, PostMetadata, PostRelation, PostReview, PostReviewTypes,
			YFolder, YPost, YPostRelation, YPostUpdate, YPostUpdateMetadata
		}
	}

	export namespace Prisma {
     export = P;
	}
}

declare global {
	export namespace Lexical {
		export = L
	}
}

declare global {
  export type YDoc = import('yjs').Doc
  export type YEvent<T> = import('yjs').YEvent<T>
}
