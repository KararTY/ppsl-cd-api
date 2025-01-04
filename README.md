# ppsl-cd-api

Based\* on [@TomDoesTech](https://github.com/TomDoesTech)'s video titled [Build a RESTful API with Fastify, Prisma & TypeScript](https://www.youtube.com/watch?v=LMoMHP44-xM).

<small>\* Partially</small>

## Libraries in use

* **Yarn** - Package manager.
* **`standard/standard`** - Code formatter & linter.
* **Fastify** - Web server.
* **Prisma** - TypeScript ORM.
* **Auth.js through `authey` & `@next-auth/prisma-adapter`** - SSO authentication.
* **`zod` & `fastify-zod`** - Request & response validation.
* **Lexical** - WYSIWYG document editor, headless. For user input validation use only.

## Setup

* Node.js LTS recommended (Node.js 18.16.0 when this was written).
* Yarn (Node.js >=16.10 (corepack) & Node.js >=18.6 (yarn@stable) installation steps).
* Copy `.env.example` file content into a `.env` file that is in the same directory.
  Fill out the .env details. **Most notably `DATABASE_PASSWORD` to continue installation.**
* Use docker compose to `docker compose up` the `compose.yaml` file. **(REQUIRES `DATABASE_PASSWORD` TO BE SET).**
* Run `yarn` to install project dependencies.
* At this point, you should probably setup the rest of the .env stuff. Like `DATABASE_URL`. Google & GitHub require OAuth apps to be set. GitHub is easiest to setup. Just create a new organisation and create an OAuth App for it. **Set CALLBACK URL TO `http://localhost:5173/api/auth/callback/github` FOR GitHub.**
* Initialise & seed the database: `yarn run prisma:db-push && yarn run prisma:seed`
* `git submodule init && git submodule update`
* `yarn start` to start server.

## License

AGPL-3.0-only
