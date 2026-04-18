import { performance } from 'node:perf_hooks'
import { type FastifyPluginAsync } from 'fastify'

type DependencyStatus = {
  status: 'up' | 'down'
  latencyMs: number
  details?: string
}

async function checkPostgres (fastify: Parameters<FastifyPluginAsync>[0]): Promise<DependencyStatus> {
  const startedAt = performance.now()

  try {
    await fastify.db.query('select 1')

    return {
      status: 'up',
      latencyMs: Math.round(performance.now() - startedAt)
    }
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - startedAt),
      details: error instanceof Error ? error.message : 'Unknown PostgreSQL error'
    }
  }
}

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async function (_request, reply) {
    const postgres = await checkPostgres(fastify)

    const isHealthy = postgres.status === 'up'

    reply.code(isHealthy ? 200 : 503)

    return {
      service: fastify.config.appName,
      environment: fastify.config.nodeEnv,
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies: {
        postgres
      }
    }
  })
}

export default healthRoutes
