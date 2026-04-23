import { type FastifyPluginAsync } from 'fastify'
import { DISPUTE_STATUSES, type DisputeStatus } from '../../../modules/disputes/types'
import { getUserDisputeById, listUserDisputes } from '../../../modules/disputes/repository'

type ListDisputesQuery = {
  status?: DisputeStatus
}

type DisputeParams = {
  disputeId: string
}

const disputeParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['disputeId'],
  properties: {
    disputeId: { type: 'string', format: 'uuid' }
  }
}

const disputesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListDisputesQuery }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...DISPUTE_STATUSES] }
        }
      }
    }
  }, async function (request) {
    const disputes = await listUserDisputes(fastify.db, request.authUser!.id, {
      status: request.query.status
    })

    return {
      disputes
    }
  })

  fastify.get<{ Params: DisputeParams }>('/:disputeId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: disputeParamsSchema
    }
  }, async function (request, reply) {
    const dispute = await getUserDisputeById(fastify.db, {
      disputeId: request.params.disputeId,
      userId: request.authUser!.id
    })

    if (dispute == null) {
      reply.notFound('Dispute not found')
      return
    }

    return {
      dispute
    }
  })
}

export default disputesRoutes
