function requirePublicEnv(name: string): string {
  const value = process.env[name]

  if (value == null || value.trim() === '') {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

export const mobileEnv = {
  apiUrl: requirePublicEnv('EXPO_PUBLIC_API_URL'),
  supabaseUrl: requirePublicEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabasePublishableKey: requirePublicEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
}
