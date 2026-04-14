import { type FastifyPluginAsync } from 'fastify'
import { verifyAndHandleMockPaymongoWebhook } from '../../../modules/payments/paymongo-mock'

type MockWebhookBody = {
  type?: string
  data?: unknown
}

const paymongoWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: MockWebhookBody }>('/', {
    schema: {
      body: {
        type: 'object',
        additionalProperties: true,
        properties: {
          type: { type: 'string' },
          data: {}
        }
      }
    }
  }, async function (request) {
    const webhook = verifyAndHandleMockPaymongoWebhook(request.body)

    return {
      webhook
    }
  })
}

export default paymongoWebhookRoutes
