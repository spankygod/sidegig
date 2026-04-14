import { type FastifyPluginAsync, type FastifyReply } from 'fastify'
import {
  acceptFundedHire,
  acceptHireCompletion,
  getHireWorkDetail,
  getUserHireById,
  listUserHires,
  markHireDone,
  startAcceptedHire
} from '../../../modules/hires/repository'
import type { AuthenticatedUser } from '../../../modules/auth/types'
import { HIRE_STATUSES, type HireStatus, type HireSummary } from '../../../modules/hires/types'
import { ensureUserProfile } from '../../../modules/users/repository'
import { openHireDispute } from '../../../modules/disputes/repository'
import { createHireReview } from '../../../modules/reviews/repository'
import { createNotification } from '../../../modules/notifications/repository'

type HireParams = {
  hireId: string
}

type ListHiresQuery = {
  status?: HireStatus
}

type HireAction = (input: {
  hireId: string
  userId: string
}) => Promise<HireSummary | null>

type OpenDisputeBody = {
  reason: string
  details?: string | null
}

type CreateReviewBody = {
  rating: number
  comment?: string | null
}

const hireParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['hireId'],
  properties: {
    hireId: { type: 'string', format: 'uuid' }
  }
}

const hiresRoutes: FastifyPluginAsync = async (fastify) => {
  async function runHireAction (
    request: { authUser: AuthenticatedUser | null, params: HireParams },
    reply: FastifyReply,
    action: HireAction,
    conflictMessage: string
  ) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const hire = await action({
      hireId: request.params.hireId,
      userId: request.authUser!.id
    })

    if (hire == null) {
      reply.conflict(conflictMessage)
      return
    }

    return {
      hire
    }
  }

  fastify.get<{ Querystring: ListHiresQuery }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...HIRE_STATUSES] }
        }
      }
    }
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const hires = await listUserHires(fastify.db, request.authUser!.id, {
      status: request.query.status
    })

    return {
      hires
    }
  })

  fastify.get<{ Params: HireParams }>('/:hireId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const hire = await getUserHireById(fastify.db, {
      hireId: request.params.hireId,
      userId: request.authUser!.id
    })

    if (hire == null) {
      reply.notFound('Hire not found')
      return
    }

    return {
      hire
    }
  })

  fastify.get<{ Params: HireParams }>('/:hireId/work-detail', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const workDetail = await getHireWorkDetail(fastify.db, {
      hireId: request.params.hireId,
      userId: request.authUser!.id
    })

    if (workDetail == null) {
      reply.notFound('Hire work detail not found')
      return
    }

    return {
      workDetail
    }
  })

  fastify.post<{ Params: HireParams }>('/:hireId/accept', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    const result = await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await acceptFundedHire(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can accept a funded hire'
    )

    if (result?.hire != null) {
      await createNotification(fastify.db, {
        userId: result.hire.posterId,
        actorId: request.authUser!.id,
        type: 'hire_updated',
        entityType: 'hire',
        entityId: result.hire.id,
        title: 'Hire accepted',
        body: 'Your worker accepted the hire.'
      })
    }

    return result
  })

  fastify.post<{ Params: HireParams }>('/:hireId/start', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    const result = await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await startAcceptedHire(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can start an accepted hire'
    )

    if (result?.hire != null) {
      await createNotification(fastify.db, {
        userId: result.hire.posterId,
        actorId: request.authUser!.id,
        type: 'hire_updated',
        entityType: 'hire',
        entityId: result.hire.id,
        title: 'Work started',
        body: 'Your worker marked the hire in progress.'
      })
    }

    return result
  })

  fastify.post<{ Params: HireParams }>('/:hireId/mark-done', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    const result = await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await markHireDone(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can mark an in-progress hire as done'
    )

    if (result?.hire != null) {
      await createNotification(fastify.db, {
        userId: result.hire.posterId,
        actorId: request.authUser!.id,
        type: 'hire_updated',
        entityType: 'hire',
        entityId: result.hire.id,
        title: 'Work marked done',
        body: 'Your worker marked the hire as done.'
      })
    }

    return result
  })

  fastify.post<{ Params: HireParams }>('/:hireId/accept-completion', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    const result = await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await acceptHireCompletion(fastify.db, { hireId, posterId: userId }),
      'Only the poster can accept a hire after the worker marks it done'
    )

    if (result?.hire != null) {
      await createNotification(fastify.db, {
        userId: result.hire.workerId,
        actorId: request.authUser!.id,
        type: 'hire_updated',
        entityType: 'hire',
        entityId: result.hire.id,
        title: 'Work accepted',
        body: 'The poster accepted your completed work.'
      })
    }

    return result
  })

  fastify.post<{ Params: HireParams, Body: OpenDisputeBody }>('/:hireId/dispute', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema,
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 3, maxLength: 160 },
          details: { type: 'string', minLength: 1, maxLength: 2000, nullable: true }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const result = await openHireDispute(fastify.db, {
      hireId: request.params.hireId,
      posterId: request.authUser!.id,
      reason: request.body.reason,
      details: request.body.details
    })

    if (result == null) {
      reply.conflict('Only the poster can dispute a hire after the worker marks it done')
      return
    }

    await createNotification(fastify.db, {
      userId: result.hire.workerId,
      actorId: request.authUser!.id,
      type: 'dispute_opened',
      entityType: 'dispute',
      entityId: result.dispute.id,
      title: 'Dispute opened',
      body: 'The poster opened a dispute for this hire.'
    })

    return result
  })

  fastify.post<{ Params: HireParams, Body: CreateReviewBody }>('/:hireId/review', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema,
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['rating'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { anyOf: [{ type: 'string', minLength: 1, maxLength: 1000 }, { type: 'null' }] }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const review = await createHireReview(fastify.db, {
      hireId: request.params.hireId,
      reviewerId: request.authUser!.id,
      rating: request.body.rating,
      comment: request.body.comment
    })

    if (review == null) {
      reply.conflict('Only completed hire participants can review each other once')
      return
    }

    await createNotification(fastify.db, {
      userId: review.revieweeId,
      actorId: request.authUser!.id,
      type: 'review_received',
      entityType: 'review',
      entityId: review.id,
      title: 'New review',
      body: 'You received a new review.'
    })

    return {
      review
    }
  })
}

export default hiresRoutes
