import fp from 'fastify-plugin'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { toAuthenticatedUser, type AuthenticatedUser } from '../modules/auth/types'

function getBearerToken (authorizationHeader: string | undefined): string | null {
  if (authorizationHeader == null) {
    return null
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

export default fp(async (fastify) => {
  fastify.decorateRequest('authUser', null)

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!fastify.supabaseConfigured || fastify.supabaseAdmin == null) {
      reply.serviceUnavailable('Supabase admin client is not configured')
      return
    }

    const accessToken = getBearerToken(request.headers.authorization)

    if (accessToken == null) {
      reply.unauthorized('Missing bearer token')
      return
    }

    const { data, error } = await fastify.supabaseAdmin.auth.getUser(accessToken)

    if (error != null || data.user == null) {
      reply.unauthorized('Invalid or expired access token')
      return
    }

    request.authUser = toAuthenticatedUser(data.user)
  })
}, {
  name: 'auth-context',
  dependencies: ['supabase-admin']
})

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthenticatedUser | null
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
