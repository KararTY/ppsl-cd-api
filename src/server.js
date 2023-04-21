import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import Fastify from "fastify"
import helmet from '@fastify/helmet'
// import Auth from "@auth/core"

import prismaPlugin from "./plugins/prisma.js"

const fastify = Fastify({
	logger: true
})

fastify.register(prismaPlugin)
fastify.register(helmet)

fastify.get("/", async (_, reply) => {
	console.log(await fastify.prisma.post.count())
	reply.send("Hello world1")
})

fastify.listen({ port: 3000, host: "0.0.0.0" })
