import { type FastifyPluginAsync, type FastifyReply } from 'fastify'
import {
  acceptFundedHire,
  acceptHireCompletion,
  disputeHireCompletion,
  getHireWorkDetail,
  getUserHireById,
  listUserHires,
  markHireDone,
  startAcceptedHire
} from '../../../modules/hires/repository'
import type { AuthenticatedUser } from '../../../modules/auth/types'
import { HIRE_STATUSES, type HireStatus, type HireSummary } from '../../../modules/hires/types'
import { ensureUserProfile } from '../../../modules/users/repository'

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
    return await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await acceptFundedHire(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can accept a funded hire'
    )
  })

  fastify.post<{ Params: HireParams }>('/:hireId/start', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    return await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await startAcceptedHire(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can start an accepted hire'
    )
  })

  fastify.post<{ Params: HireParams }>('/:hireId/mark-done', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    return await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await markHireDone(fastify.db, { hireId, workerId: userId }),
      'Only the hired worker can mark an in-progress hire as done'
    )
  })

  fastify.post<{ Params: HireParams }>('/:hireId/accept-completion', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    return await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await acceptHireCompletion(fastify.db, { hireId, posterId: userId }),
      'Only the poster can accept a hire after the worker marks it done'
    )
  })

  fastify.post<{ Params: HireParams }>('/:hireId/dispute', {
    onRequest: [fastify.authenticate],
    schema: {
      params: hireParamsSchema
    }
  }, async function (request, reply) {
    return await runHireAction(
      request,
      reply,
      async ({ hireId, userId }) => await disputeHireCompletion(fastify.db, { hireId, posterId: userId }),
      'Only the poster can dispute a hire after the worker marks it done'
    )
  })
}

export default hiresRoutes
