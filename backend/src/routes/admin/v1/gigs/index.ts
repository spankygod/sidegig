import { type FastifyPluginAsync } from 'fastify'
import { listAdminGigs } from '../../../../modules/admin/repository'
import { GIG_STATUSES, type GigStatus } from '../../../../modules/gigs/types'

type ListAdminGigsQuery = {
  status?: GigStatus
  limit?: number
}

const adminGigsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListAdminGigsQuery }>('/', {
    onRequest: [fastify.authenticateAdmin],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...GIG_STATUSES] },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    const gigs = await listAdminGigs(fastify.db, {
      status: request.query.status,
      limit: request.query.limit
    })

    return {
      gigs
    }
  })
}

export default adminGigsRoutes
