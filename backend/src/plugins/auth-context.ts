import fp from 'fastify-plugin'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import {
  toAuthenticatedUser,
  toAuthenticatedUserFromClaims,
  type AuthenticatedUser
} from '../modules/auth/types'

function getBearerToken (authorizationHeader: string | undefined): string | null {
  if (authorizationHeader == null) {
    return null
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

export default fp(async (fastify) => {
  fastify.decorateRequest('authUser', null)
  const authUserCache = new Map<string, { expiresAt: number, user: AuthenticatedUser }>()
  const authUserInFlight = new Map<string, Promise<AuthenticatedUser | null>>()
  const jwtIssuer = fastify.config.hasSupabase
    ? new URL('/auth/v1', fastify.config.supabaseUrl).toString().replace(/\/$/, '')
    : null
  const jwksUrl = fastify.config.hasSupabase
    ? new URL('/auth/v1/.well-known/jwks.json', fastify.config.supabaseUrl)
    : null
  const jwks = fastify.config.hasSupabase
    ? createRemoteJWKSet(jwksUrl!)
    : null

  if (jwksUrl != null) {
    // Warm the JWKS cache during startup so the first authenticated request does less work.
    void fetch(jwksUrl).catch(() => {})
  }

  function getCachedAuthUser (accessToken: string): AuthenticatedUser | null {
    const cachedEntry = authUserCache.get(accessToken)

    if (cachedEntry == null) {
      return null
    }

    if (cachedEntry.expiresAt <= Date.now()) {
      authUserCache.delete(accessToken)
      return null
    }

    return cachedEntry.user
  }

  async function resolveAuthUserFromToken (accessToken: string): Promise<AuthenticatedUser | null> {
    const cachedUser = getCachedAuthUser(accessToken)

    if (cachedUser != null) {
      return cachedUser
    }

    const inFlightResolution = authUserInFlight.get(accessToken)

    if (inFlightResolution != null) {
      return await inFlightResolution
    }

    const resolution = (async () => {
      if (jwks != null && jwtIssuer != null) {
        try {
          const verifiedToken = await jwtVerify(accessToken, jwks, {
            issuer: jwtIssuer
          })
          const authUserFromClaims = toAuthenticatedUserFromClaims(verifiedToken.payload as JWTPayload & Record<string, unknown>)

          if (authUserFromClaims != null) {
            const expiresAt = typeof verifiedToken.payload.exp === 'number'
              ? verifiedToken.payload.exp * 1000
              : Date.now() + 60_000

            authUserCache.set(accessToken, {
              user: authUserFromClaims,
              expiresAt
            })

            return authUserFromClaims
          }
        } catch {
          // Fall back to the remote Supabase user lookup when local verification is unavailable.
        }
      }

      const { data, error } = await fastify.supabaseAdmin!.auth.getUser(accessToken)

      if (error != null || data.user == null) {
        return null
      }

      return toAuthenticatedUser(data.user)
    })()

    authUserInFlight.set(accessToken, resolution)

    try {
      return await resolution
    } finally {
      authUserInFlight.delete(accessToken)
    }
  }

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

    const authUser = await resolveAuthUserFromToken(accessToken)

    if (authUser == null) {
      reply.unauthorized('Invalid or expired access token')

      return
    }

    request.authUser = authUser
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await resolveAuthUser(request, reply, true)
  })

  fastify.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    await resolveAuthUser(request, reply, true)

    if (reply.sent) {
      return
    }

    if (request.authUser == null) {
      reply.unauthorized('Missing authenticated user')
      return
    }

    if (!fastify.config.adminUserIds.includes(request.authUser.id)) {
      reply.forbidden('Admin access required')
    }
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
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    tryAuthenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
