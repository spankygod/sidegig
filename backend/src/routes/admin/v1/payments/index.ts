import { type FastifyPluginAsync } from 'fastify'
import { listAdminPayments } from '../../../../modules/payments/repository'
import { PAYMENT_STATUSES, type PaymentStatus } from '../../../../modules/payments/types'

type ListAdminPaymentsQuery = {
  status?: PaymentStatus
  limit?: number
}

const adminPaymentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListAdminPaymentsQuery }>('/', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...PAYMENT_STATUSES] },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const payments = await listAdminPayments(fastify.db, {
      status: request.query.status,
      limit: request.query.limit
    })

    return {
      payments
    }
  })
}

export default adminPaymentsRoutes
