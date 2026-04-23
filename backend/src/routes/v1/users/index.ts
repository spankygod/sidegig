import { type FastifyPluginAsync } from 'fastify'
import { getPublicUserProfileById } from '../../../modules/users/repository'
import { listUserReceivedReviews } from '../../../modules/reviews/repository'

type UserParams = {
  userId: string
}

type ReviewsQuery = {
  limit?: number
}

const userParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['userId'],
  properties: {
    userId: { type: 'string', format: 'uuid' }
  }
}

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: UserParams }>('/:userId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: userParamsSchema
    }
  }, async function (request, reply) {
    const profile = await getPublicUserProfileById(fastify.db, request.params.userId)

    if (profile == null) {
      reply.notFound('User profile not found')
      return
    }

    return {
      profile
    }
  })

  fastify.get<{ Params: UserParams, Querystring: ReviewsQuery }>('/:userId/reviews', {
    onRequest: [fastify.authenticate],
    schema: {
      params: userParamsSchema,
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const reviews = await listUserReceivedReviews(fastify.db, {
      userId: request.params.userId,
      limit: request.query.limit
    })

    return {
      reviews
    }
  })
}

export default usersRoutes
