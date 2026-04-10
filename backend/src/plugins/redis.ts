import fp from 'fastify-plugin'
import Redis from 'ioredis'

export default fp(async (fastify) => {
  const redis = new Redis(fastify.config.redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null
  })

  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    if (redis.status === 'wait' || redis.status === 'end') {
      redis.disconnect()
      return
    }

    try {
      await redis.quit()
    } catch {
      redis.disconnect()
    }
  })
}, {
  name: 'redis',
  dependencies: ['app-config']
})

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}
