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

async function checkRedis (fastify: Parameters<FastifyPluginAsync>[0]): Promise<DependencyStatus> {
  const startedAt = performance.now()

  try {
    if (fastify.redis.status === 'wait') {
      await fastify.redis.connect()
    }

    const response = await fastify.redis.ping()

    if (response !== 'PONG') {
      throw new Error(`Unexpected Redis PING response: ${response}`)
    }

    return {
      status: 'up',
      latencyMs: Math.round(performance.now() - startedAt)
    }
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - startedAt),
      details: error instanceof Error ? error.message : 'Unknown Redis error'
    }
  }
}

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async function (_request, reply) {
    const [postgres, redis] = await Promise.all([
      checkPostgres(fastify),
      checkRedis(fastify)
    ])

    const isHealthy = postgres.status === 'up' && redis.status === 'up'

    reply.code(isHealthy ? 200 : 503)

    return {
      service: fastify.config.appName,
      environment: fastify.config.nodeEnv,
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies: {
        postgres,
        redis
      }
    }
  })
}

export default healthRoutes
