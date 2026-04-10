import { type FastifyPluginAsync } from 'fastify'

const authMeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async function (request) {
    return {
      user: request.authUser
    }
  })
}

export default authMeRoute
