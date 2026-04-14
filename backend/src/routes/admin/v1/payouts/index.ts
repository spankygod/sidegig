import { type FastifyPluginAsync } from 'fastify'
import { listAdminPayouts, markPayoutPaid } from '../../../../modules/payments/repository'
import { PAYOUT_STATUSES, type PayoutStatus } from '../../../../modules/payments/types'

type ListAdminPayoutsQuery = {
  status?: PayoutStatus
  limit?: number
}

type PayoutParams = {
  payoutId: string
}

type MarkPayoutPaidBody = {
  providerReference?: string | null
}

const payoutParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['payoutId'],
  properties: {
    payoutId: { type: 'string', format: 'uuid' }
  }
}

const adminPayoutsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListAdminPayoutsQuery }>('/', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...PAYOUT_STATUSES] },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const payouts = await listAdminPayouts(fastify.db, {
      status: request.query.status,
      limit: request.query.limit
    })

    return {
      payouts
    }
  })

  fastify.post<{ Params: PayoutParams, Body: MarkPayoutPaidBody }>('/:payoutId/mark-paid', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      params: payoutParamsSchema,
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          providerReference: { anyOf: [{ type: 'string', minLength: 1, maxLength: 200 }, { type: 'null' }] }
        }
      }
    }
  }, async function (request, reply) {
    const payout = await markPayoutPaid(fastify.db, {
      payoutId: request.params.payoutId,
      providerReference: request.body?.providerReference
    })

    if (payout == null) {
      reply.conflict('Payout cannot be marked paid')
      return
    }

    return {
      payout
    }
  })
}

export default adminPayoutsRoutes
