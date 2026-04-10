import { type FastifyPluginAsync } from 'fastify'
import { createGig, listPublicGigs } from '../../../modules/gigs/repository'
import { DURATION_BUCKETS, GIG_CATEGORIES, type CreateGigInput, type GigCategory } from '../../../modules/gigs/types'
import { ensureUserProfile } from '../../../modules/users/repository'

type ListGigsQuery = {
  category?: GigCategory
  city?: string
  limit?: number
}

type CreateGigBody = CreateGigInput

const gigsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListGigsQuery }>('/', {
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          category: { type: 'string', enum: [...GIG_CATEGORIES] },
          city: { type: 'string', minLength: 1, maxLength: 80 },
          limit: { type: 'integer', minimum: 1, maximum: 50 }
        }
      }
    }
  }, async function (request) {
    const gigs = await listPublicGigs(fastify.db, {
      category: request.query.category,
      city: request.query.city?.trim(),
      limit: request.query.limit ?? 20
    })

    return {
      gigs
    }
  })

  fastify.post<{ Body: CreateGigBody }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'category',
          'description',
          'priceAmount',
          'durationBucket',
          'city',
          'barangay',
          'latitude',
          'longitude',
          'scheduleSummary'
        ],
        properties: {
          title: { type: 'string', minLength: 4, maxLength: 120 },
          category: { type: 'string', enum: [...GIG_CATEGORIES] },
          description: { type: 'string', minLength: 20, maxLength: 3000 },
          priceAmount: { type: 'integer', minimum: 100 },
          durationBucket: { type: 'string', enum: [...DURATION_BUCKETS] },
          city: { type: 'string', minLength: 1, maxLength: 80 },
          barangay: { type: 'string', minLength: 1, maxLength: 80 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          scheduleSummary: { type: 'string', minLength: 4, maxLength: 280 },
          supervisorPresent: { type: 'boolean' },
          ppeProvided: { type: 'boolean' },
          helperOnlyConfirmation: { type: 'boolean' },
          physicalLoad: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
          startsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
          endsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    if (request.body.category === 'construction_helper') {
      if (
        request.body.supervisorPresent == null ||
        request.body.ppeProvided == null ||
        request.body.helperOnlyConfirmation !== true ||
        request.body.physicalLoad == null ||
        request.body.startsAt == null ||
        request.body.endsAt == null
      ) {
        reply.badRequest('Construction helper gigs require supervisor, PPE, helper-only confirmation, physical load, and start/end time')
        return
      }
    }

    const gig = await createGig(fastify.db, request.authUser!.id, {
      ...request.body,
      title: request.body.title.trim(),
      description: request.body.description.trim(),
      city: request.body.city.trim(),
      barangay: request.body.barangay.trim(),
      scheduleSummary: request.body.scheduleSummary.trim(),
      physicalLoad: request.body.physicalLoad?.trim() ?? null
    })

    reply.code(201)

    return {
      gig
    }
  })
}

export default gigsRoutes
