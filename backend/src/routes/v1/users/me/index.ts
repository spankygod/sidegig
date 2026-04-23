import { type FastifyPluginAsync } from 'fastify'
import { ensureUserProfile, getUserProfileById, updateUserProfile } from '../../../../modules/users/repository'
import type { UpdateUserProfileInput } from '../../../../modules/users/types'
import { findContactDetailViolationInFields, formatModerationViolation } from '../../../../modules/moderation/policy'

type UpdateProfileBody = {
  displayName?: string
  phone?: string | null
  avatarUrl?: string | null
  pinCode?: string | null
  province?: string | null
  city?: string | null
  barangay?: string | null
  latitude?: number | null
  longitude?: number | null
  serviceRadiusKm?: number
  bio?: string | null
  skills?: string[]
}

function hasOwnField(body: UpdateProfileBody, field: keyof UpdateProfileBody): boolean {
  return Object.prototype.hasOwnProperty.call(body, field)
}

function readOptionalTrimmedString(
  body: UpdateProfileBody,
  field: 'phone' | 'avatarUrl' | 'pinCode' | 'province' | 'city' | 'barangay' | 'bio'
): string | null | undefined {
  if (!hasOwnField(body, field)) {
    return undefined
  }

  const value = body[field]

  if (value == null) {
    return null
  }

  return value.trim()
}

function readOptionalCoordinate(
  value: number | null | undefined,
  shouldUseValue: boolean
): number | null | undefined {
  if (!shouldUseValue) {
    return undefined
  }

  if (value == null) {
    return null
  }

  return value
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
  }, async function (request, reply) {
    const profile = await getUserProfileById(fastify.db, request.authUser!.id)

    if (profile == null) {
      reply.notFound('Profile not found')
      return
    }

    return {
      profile
    }
  })

  fastify.post('/provision', {
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
          phone: { anyOf: [{ type: 'string', minLength: 7, maxLength: 24 }, { type: 'null' }] },
          avatarUrl: { anyOf: [{ type: 'string', minLength: 1, maxLength: 5000 }, { type: 'null' }] },
          pinCode: { anyOf: [{ type: 'string', minLength: 4, maxLength: 8, pattern: '^[0-9]+$' }, { type: 'null' }] },
          province: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
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
      phone: readOptionalTrimmedString(request.body, 'phone'),
      avatarUrl: readOptionalTrimmedString(request.body, 'avatarUrl'),
      pinCode: readOptionalTrimmedString(request.body, 'pinCode'),
      province: readOptionalTrimmedString(request.body, 'province'),
      city: readOptionalTrimmedString(request.body, 'city'),
      barangay: readOptionalTrimmedString(request.body, 'barangay'),
      latitude: readOptionalCoordinate(request.body.latitude, hasLatitude),
      longitude: readOptionalCoordinate(request.body.longitude, hasLongitude),
      serviceRadiusKm: request.body.serviceRadiusKm,
      bio: readOptionalTrimmedString(request.body, 'bio'),
      skills: normalizeSkills(request.body.skills)
    }

    if (input.displayName != null && input.displayName.length < 2) {
      reply.badRequest('Display name must be at least 2 characters long')
      return
    }

    if (input.phone != null) {
      const normalizedDigits = input.phone.replace(/\D/g, '')

      if (normalizedDigits.length < 10 || normalizedDigits.length > 15) {
        reply.badRequest('Phone number must be between 10 and 15 digits')
        return
      }
    }

    if (input.pinCode != null && !/^\d{4,8}$/.test(input.pinCode)) {
      reply.badRequest('PIN code must be 4 to 8 digits')
      return
    }

    const moderationFields = [
      { label: 'Display name', value: input.displayName },
      { label: 'Bio', value: input.bio }
    ]

    for (const skill of input.skills ?? []) {
      moderationFields.push({
        label: 'Skill',
        value: skill
      })
    }

    const moderationViolation = findContactDetailViolationInFields(moderationFields)

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
