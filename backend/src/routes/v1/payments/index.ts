import { type FastifyPluginAsync } from 'fastify'
import { getUserPaymentById, listUserPayments } from '../../../modules/payments/repository'

type ListPaymentsQuery = {
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

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListPaymentsQuery }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const payments = await listUserPayments(fastify.db, {
      userId: request.authUser!.id,
      limit: request.query.limit
    })

    return {
      payments
    }
  })

  fastify.get<{ Params: PaymentParams }>('/:paymentId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: paymentParamsSchema
    }
  }, async function (request, reply) {
    const payment = await getUserPaymentById(fastify.db, {
      paymentId: request.params.paymentId,
      userId: request.authUser!.id
    })

    if (payment == null) {
      reply.notFound('Payment not found')
      return
    }

    return {
      payment
    }
  })
}

export default paymentsRoutes
