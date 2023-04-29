import { FastifyInstance as Instance, FastifyReply as Reply, FastifyRequest as Request } from "fastify";

declare global {
	export namespace Fastify {
		export {Instance, Reply, Request}
	}
}

declare global {
	export type PrismaClient = import('../.prisma/client').PrismaClient
}
