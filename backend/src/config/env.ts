import dotenv from 'dotenv'

export type NodeEnv = 'development' | 'test' | 'production'

export interface AppConfig {
  appName: string
  nodeEnv: NodeEnv
  host: string
  port: number
  databaseUrl: string
  redisUrl: string
  jwtSecret: string
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string
  hasSupabase: boolean
  paymongoPublicKey: string
  paymongoSecretKey: string
  paymongoWebhookSecret: string
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
}

let hasLoadedEnvFile = false

function loadEnvFile (): void {
  if (hasLoadedEnvFile) {
    return
  }

  dotenv.config()
  hasLoadedEnvFile = true
}

function parseNodeEnv (value: string | undefined): NodeEnv {
  const nodeEnv = value ?? 'development'

  if (nodeEnv === 'development' || nodeEnv === 'test' || nodeEnv === 'production') {
    return nodeEnv
  }

  throw new Error(`Invalid NODE_ENV: ${nodeEnv}`)
}

function parsePort (value: string | undefined): number {
  const port = Number.parseInt(value ?? '3000', 10)

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT: ${value ?? ''}`)
  }

  return port
}

function requireString (value: string | undefined, key: string, fallback?: string): string {
  const resolved = value ?? fallback

  if (resolved == null || resolved.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return resolved
}

export function buildAppConfig (env: NodeJS.ProcessEnv = process.env): AppConfig {
  loadEnvFile()

  const nodeEnv = parseNodeEnv(env.NODE_ENV)

  return {
    appName: requireString(env.APP_NAME, 'APP_NAME', 'Raket API'),
    nodeEnv,
    host: requireString(env.HOST, 'HOST', '0.0.0.0'),
    port: parsePort(env.PORT),
    databaseUrl: requireString(
      env.DATABASE_URL,
      'DATABASE_URL',
      'postgres://postgres:postgres@127.0.0.1:5432/raket'
    ),
    redisUrl: requireString(env.REDIS_URL, 'REDIS_URL', 'redis://127.0.0.1:6379'),
    jwtSecret: requireString(env.JWT_SECRET, 'JWT_SECRET', 'change-me-before-production'),
    supabaseUrl: env.SUPABASE_URL?.trim() ?? '',
    supabaseAnonKey: env.SUPABASE_ANON_KEY?.trim() ?? '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '',
    hasSupabase: Boolean(env.SUPABASE_URL?.trim() && env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    paymongoPublicKey: env.PAYMONGO_PUBLIC_KEY?.trim() ?? '',
    paymongoSecretKey: env.PAYMONGO_SECRET_KEY?.trim() ?? '',
    paymongoWebhookSecret: env.PAYMONGO_WEBHOOK_SECRET?.trim() ?? '',
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test'
  }
}
