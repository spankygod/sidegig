import { type FastifyPluginAsync } from 'fastify'
import { createGigApplication, isUniqueViolation, listWorkerApplications } from '../../../modules/applications/repository'
import { getGigOwnership } from '../../../modules/gigs/repository'
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

    const gig = await getGigOwnership(fastify.db, request.body.gigId)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    if (gig.posterId === request.authUser!.id) {
      reply.badRequest('You cannot apply to your own gig')
      return
    }

    if (!['published', 'shortlisting'].includes(gig.status)) {
      reply.conflict('This gig is no longer accepting applications')
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
