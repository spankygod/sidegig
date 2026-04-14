import { type FastifyPluginAsync } from 'fastify'
import { listAdminDisputes } from '../../../../modules/admin/repository'
import { DISPUTE_STATUSES, type DisputeStatus } from '../../../../modules/disputes/types'

type ListAdminDisputesQuery = {
  status?: DisputeStatus
  limit?: number
}

const adminDisputesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListAdminDisputesQuery }>('/', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...DISPUTE_STATUSES] },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const disputes = await listAdminDisputes(fastify.db, {
      status: request.query.status,
      limit: request.query.limit
    })

    return {
      disputes
    }
  })
}

export default adminDisputesRoutes
