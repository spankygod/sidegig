import { type FastifyPluginAsync } from 'fastify'
import { getAdminOverview } from '../../../../modules/admin/repository'

const adminOverviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticateAdmin]
  }, async function () {
    const overview = await getAdminOverview(fastify.db)

    return {
      overview
    }
  })
}

export default adminOverviewRoutes
