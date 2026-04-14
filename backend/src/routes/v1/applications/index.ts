import { type FastifyPluginAsync } from 'fastify'
import { createGigApplication, isUniqueViolation, listWorkerApplications } from '../../../modules/applications/repository'
import { getGigEligibilityForWorker } from '../../../modules/gigs/repository'
import { ensureUserProfile } from '../../../modules/users/repository'

type CreateApplicationBody = {
  gigId: string
  intro: string
  availability: string
}

const applicationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const applications = await listWorkerApplications(fastify.db, request.authUser!.id)

    return {
      applications
    }
  })

  fastify.post<{ Body: CreateApplicationBody }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId', 'intro', 'availability'],
        properties: {
          gigId: { type: 'string', format: 'uuid' },
          intro: { type: 'string', minLength: 20, maxLength: 1200 },
          availability: { type: 'string', minLength: 4, maxLength: 280 }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gig = await getGigEligibilityForWorker(fastify.db, request.body.gigId, request.authUser!.id)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    if (gig.posterId === request.authUser!.id) {
      reply.badRequest('You cannot apply to your own gig')
      return
    }

    if (gig.status !== 'published') {
      reply.conflict('This gig is no longer accepting applications')
      return
    }

    if (gig.workerLatitude == null || gig.workerLongitude == null) {
      reply.badRequest('Set your worker location before applying to gigs')
      return
    }

    if (gig.distanceKm == null) {
      reply.forbidden('Unable to verify your distance from this gig')
      return
    }

    if (gig.workerServiceRadiusKm != null && gig.distanceKm > gig.workerServiceRadiusKm) {
      reply.forbidden(`This gig is ${gig.distanceKm} km away, outside your service radius`)
      return
    }

    if (gig.distanceKm > gig.gigApplicationRadiusKm) {
      reply.forbidden(`This gig is ${gig.distanceKm} km away, outside the poster's application radius`)
      return
    }

    try {
      const application = await createGigApplication(
        fastify.db,
        request.authUser!.id,
        {
          gigId: request.body.gigId,
          intro: request.body.intro.trim(),
          availability: request.body.availability.trim()
        }
      )

      reply.code(201)

      return {
        application
      }
    } catch (error) {
      if (isUniqueViolation(error)) {
        reply.conflict('You have already applied to this gig')
        return
      }

      throw error
    }
  })
}

export default applicationsRoutes
