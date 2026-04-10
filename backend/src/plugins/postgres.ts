import fp from 'fastify-plugin'
import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../../drizzle/schema'

export default fp(async (fastify) => {
  const db = new Pool({
    connectionString: fastify.config.databaseUrl
  })
  const orm = drizzle(db, { schema })

  fastify.decorate('db', db)
  fastify.decorate('orm', orm)

  fastify.addHook('onClose', async () => {
    await db.end()
  })
}, {
  name: 'postgres',
  dependencies: ['app-config']
})

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
    orm: NodePgDatabase<typeof schema>
  }
}
