import { type FastifyPluginAsync } from 'fastify'
import {
  createGigApplication,
  getWorkerApplicationById,
  isUniqueViolation,
  listWorkerApplications,
  withdrawWorkerApplication
} from '../../../modules/applications/repository'
import { getGigEligibilityForWorker } from '../../../modules/gigs/repository'
import { ensureUserProfile } from '../../../modules/users/repository'
import { createNotification } from '../../../modules/notifications/repository'

type CreateApplicationBody = {
  gigId: string
  intro: string
  availability: string
}

type ApplicationParams = {
  applicationId: string
}

const applicationParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['applicationId'],
  properties: {
    applicationId: { type: 'string', format: 'uuid' }
  }
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

      await createNotification(fastify.db, {
        userId: gig.posterId,
        actorId: request.authUser!.id,
        type: 'application_received',
        entityType: 'application',
        entityId: application.id,
        title: 'New application',
        body: 'A worker applied to your gig.'
      })

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

  fastify.get<{ Params: ApplicationParams }>('/:applicationId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: applicationParamsSchema
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const application = await getWorkerApplicationById(fastify.db, {
      applicationId: request.params.applicationId,
      workerId: request.authUser!.id
    })

    if (application == null) {
      reply.notFound('Application not found')
      return
    }

    return {
      application
    }
  })

  fastify.post<{ Params: ApplicationParams }>('/:applicationId/withdraw', {
    onRequest: [fastify.authenticate],
    schema: {
      params: applicationParamsSchema
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const application = await withdrawWorkerApplication(fastify.db, {
      applicationId: request.params.applicationId,
      workerId: request.authUser!.id
    })

    if (application == null) {
      reply.conflict('Only submitted applications can be withdrawn')
      return
    }

    return {
      application
    }
  })
}

export default applicationsRoutes
