import { type FastifyPluginAsync } from 'fastify'
import { ensureUserProfile, updateUserProfile } from '../../../../modules/users/repository'
import type { UpdateUserProfileInput } from '../../../../modules/users/types'

type UpdateProfileBody = {
  displayName?: string
  city?: string | null
  barangay?: string | null
  bio?: string | null
  skills?: string[]
}

function normalizeSkills (skills: string[] | undefined): string[] | undefined {
  if (skills == null) {
    return undefined
  }

  return [...new Set(
    skills
      .map((skill) => skill.trim())
      .filter((skill) => skill !== '')
  )]
}

const usersMeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async function (request) {
    const profile = await ensureUserProfile(fastify.db, request.authUser!)

    return {
      profile
    }
  })

  fastify.patch<{ Body: UpdateProfileBody }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          displayName: { type: 'string', minLength: 2, maxLength: 50 },
          city: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
          barangay: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
          bio: { anyOf: [{ type: 'string', maxLength: 280 }, { type: 'null' }] },
          skills: {
            type: 'array',
            maxItems: 20,
            items: { type: 'string', minLength: 1, maxLength: 40 }
          }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const input: UpdateUserProfileInput = {
      displayName: request.body.displayName?.trim(),
      city: Object.prototype.hasOwnProperty.call(request.body, 'city')
        ? request.body.city?.trim() ?? null
        : undefined,
      barangay: Object.prototype.hasOwnProperty.call(request.body, 'barangay')
        ? request.body.barangay?.trim() ?? null
        : undefined,
      bio: Object.prototype.hasOwnProperty.call(request.body, 'bio')
        ? request.body.bio?.trim() ?? null
        : undefined,
      skills: normalizeSkills(request.body.skills)
    }

    if (input.displayName != null && input.displayName.length < 2) {
      reply.badRequest('Display name must be at least 2 characters long')
      return
    }

    const profile = await updateUserProfile(
      fastify.db,
      request.authUser!.id,
      input
    )

    return {
      profile
    }
  })
}

export default usersMeRoutes
