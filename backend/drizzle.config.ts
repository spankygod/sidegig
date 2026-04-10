import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (process.env.DATABASE_URL == null || process.env.DATABASE_URL.trim() === '') {
  throw new Error('DATABASE_URL is required for Drizzle configuration')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  strict: true,
  verbose: true
})
