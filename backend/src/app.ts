import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import sensible from '@fastify/sensible'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import authContextPlugin from './plugins/auth-context'
import configPlugin from './plugins/config'
import postgresPlugin from './plugins/postgres'
import supabasePlugin from './plugins/supabase'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  await fastify.register(configPlugin)
  await fastify.register(sensible)
  await fastify.register(postgresPlugin)
  await fastify.register(supabasePlugin)
  await fastify.register(authContextPlugin)

  // This loads all plugins defined in routes
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }
