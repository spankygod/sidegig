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

  async function resolveAuthUser (
    request: FastifyRequest,
    reply: FastifyReply,
    required: boolean
  ): Promise<void> {
    const accessToken = getBearerToken(request.headers.authorization)

    if (accessToken == null) {
      if (required) {
        reply.unauthorized('Missing bearer token')
      }

      return
    }

    if (!fastify.supabaseConfigured || fastify.supabaseAdmin == null) {
      reply.serviceUnavailable('Supabase admin client is not configured')

      return
    }

    const { data, error } = await fastify.supabaseAdmin.auth.getUser(accessToken)

    if (error != null || data.user == null) {
      reply.unauthorized('Invalid or expired access token')

      return
    }

    request.authUser = toAuthenticatedUser(data.user)
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await resolveAuthUser(request, reply, true)
  })

  fastify.decorate('tryAuthenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await resolveAuthUser(request, reply, false)
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
    tryAuthenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
