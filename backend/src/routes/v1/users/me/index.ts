import { type FastifyPluginAsync } from 'fastify'
import { ensureUserProfile, updateUserProfile } from '../../../../modules/users/repository'
import type { UpdateUserProfileInput } from '../../../../modules/users/types'
import { findContactDetailViolationInFields, formatModerationViolation } from '../../../../modules/moderation/policy'

type UpdateProfileBody = {
  displayName?: string
  city?: string | null
  barangay?: string | null
  latitude?: number | null
  longitude?: number | null
  serviceRadiusKm?: number
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
          latitude: { anyOf: [{ type: 'number', minimum: -90, maximum: 90 }, { type: 'null' }] },
          longitude: { anyOf: [{ type: 'number', minimum: -180, maximum: 180 }, { type: 'null' }] },
          serviceRadiusKm: { type: 'integer', minimum: 1, maximum: 200 },
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

    const hasLatitude = Object.prototype.hasOwnProperty.call(request.body, 'latitude')
    const hasLongitude = Object.prototype.hasOwnProperty.call(request.body, 'longitude')

    if (hasLatitude !== hasLongitude) {
      reply.badRequest('Latitude and longitude must be updated together')
      return
    }

    const input: UpdateUserProfileInput = {
      displayName: request.body.displayName?.trim(),
      city: Object.prototype.hasOwnProperty.call(request.body, 'city')
        ? request.body.city?.trim() ?? null
        : undefined,
      barangay: Object.prototype.hasOwnProperty.call(request.body, 'barangay')
        ? request.body.barangay?.trim() ?? null
        : undefined,
      latitude: hasLatitude ? request.body.latitude ?? null : undefined,
      longitude: hasLongitude ? request.body.longitude ?? null : undefined,
      serviceRadiusKm: request.body.serviceRadiusKm,
      bio: Object.prototype.hasOwnProperty.call(request.body, 'bio')
        ? request.body.bio?.trim() ?? null
        : undefined,
      skills: normalizeSkills(request.body.skills)
    }

    if (input.displayName != null && input.displayName.length < 2) {
      reply.badRequest('Display name must be at least 2 characters long')
      return
    }

    const moderationViolation = findContactDetailViolationInFields([
      { label: 'Display name', value: input.displayName },
      { label: 'Bio', value: input.bio },
      ...(input.skills ?? []).map((skill) => ({ label: 'Skill', value: skill }))
    ])

    if (moderationViolation != null) {
      reply.badRequest(formatModerationViolation(moderationViolation))
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
