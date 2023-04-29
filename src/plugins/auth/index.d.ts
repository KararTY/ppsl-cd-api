import { UserSessionSchema } from "../../modules/user/user.schema.js";
import { authenticate } from "./index.js";

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate
  }

	interface FastifyRequest {
		session?: {
			user: UserSessionSchema,
			expires: string
		}
	}
}
