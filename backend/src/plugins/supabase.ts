import fp from 'fastify-plugin'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default fp(async (fastify) => {
  if (!fastify.config.hasSupabase) {
    fastify.decorate('supabaseAdmin', null)
    fastify.decorate('supabaseConfigured', false)
    return
  }

  const supabaseAdmin = createClient(
    fastify.config.supabaseUrl,
    fastify.config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  fastify.decorate('supabaseAdmin', supabaseAdmin)
  fastify.decorate('supabaseConfigured', true)
}, {
  name: 'supabase-admin',
  dependencies: ['app-config']
})

declare module 'fastify' {
  interface FastifyInstance {
    supabaseAdmin: SupabaseClient | null
    supabaseConfigured: boolean
  }
}
