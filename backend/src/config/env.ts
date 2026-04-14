import dotenv from 'dotenv'

export type NodeEnv = 'development' | 'test' | 'production'

export interface AppConfig {
  appName: string
  nodeEnv: NodeEnv
  host: string
  port: number
  databaseUrl: string
  jwtSecret: string
  supabaseUrl: string
  supabasePublishableKey: string
  supabaseSecretKey: string
  hasSupabase: boolean
  paymongoPublicKey: string
  paymongoSecretKey: string
  paymongoWebhookSecret: string
  adminUserIds: string[]
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

function getSupabasePublishableKey (env: NodeJS.ProcessEnv): string {
  return env.SUPABASE_PUBLISHABLE_KEY?.trim() ?? env.SUPABASE_ANON_KEY?.trim() ?? ''
}

function getSupabaseSecretKey (env: NodeJS.ProcessEnv): string {
  return env.SUPABASE_SECRET_KEY?.trim() ?? env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? ''
}

function parseCommaSeparatedList (value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
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
    jwtSecret: requireString(env.JWT_SECRET, 'JWT_SECRET', 'change-me-before-production'),
    supabaseUrl: env.SUPABASE_URL?.trim() ?? '',
    supabasePublishableKey: getSupabasePublishableKey(env),
    supabaseSecretKey: getSupabaseSecretKey(env),
    hasSupabase: Boolean(env.SUPABASE_URL?.trim() && getSupabaseSecretKey(env)),
    paymongoPublicKey: env.PAYMONGO_PUBLIC_KEY?.trim() ?? '',
    paymongoSecretKey: env.PAYMONGO_SECRET_KEY?.trim() ?? '',
    paymongoWebhookSecret: env.PAYMONGO_WEBHOOK_SECRET?.trim() ?? '',
    adminUserIds: parseCommaSeparatedList(env.ADMIN_USER_IDS),
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test'
  }
}
