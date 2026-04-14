import { type FastifyPluginAsync } from 'fastify'
import { listAdminPayments, markPaymentRefunded } from '../../../../modules/payments/repository'
import { createMockPaymongoRefund } from '../../../../modules/payments/paymongo-mock'
import { PAYMENT_STATUSES, type PaymentStatus } from '../../../../modules/payments/types'

type ListAdminPaymentsQuery = {
  status?: PaymentStatus
  limit?: number
}

type PaymentParams = {
  paymentId: string
}

const paymentParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['paymentId'],
  properties: {
    paymentId: { type: 'string', format: 'uuid' }
  }
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

  fastify.post<{ Params: PaymentParams }>('/:paymentId/refund', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      params: paymentParamsSchema
    }
  }, async function (request, reply) {
    const refund = createMockPaymongoRefund(request.params.paymentId)
    const payment = await markPaymentRefunded(fastify.db, {
      paymentId: request.params.paymentId,
      providerReference: refund.providerReference
    })

    if (payment == null) {
      reply.notFound('Payment not found')
      return
    }

    return {
      payment,
      refund
    }
  })
}

export default adminPaymentsRoutes
