# Raket Backend

The backend is a Fastify API that assumes Supabase for auth and managed Postgres, with Redis kept for caching, queues, and presence.

## Local setup

1. Copy `.env.example` to `.env`
2. Start local services from the repo root:

```bash
docker compose up -d
```

3. If you do not have a Supabase project yet, the local Compose Postgres instance can act as a temporary development database.

4. Start the API:

```bash
npm run dev
```

## Default local services

- PostgreSQL: `postgres://postgres:postgres@127.0.0.1:5432/raket`
- Redis: `redis://127.0.0.1:6379`

For Supabase-backed environments, point `DATABASE_URL` to your Supabase Postgres connection string and set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Drizzle ORM

Drizzle is configured against the existing Postgres database and schema.

Files:

- `drizzle.config.ts`
- `drizzle/schema.ts`

Useful commands:

```bash
npm run drizzle:generate
npm run drizzle:push
npm run drizzle:pull
npm run drizzle:studio
```

The Fastify Postgres plugin now exposes both:

- `fastify.db` for the existing `pg` pool
- `fastify.orm` for the typed Drizzle client

## Useful routes

- `GET /`
- `GET /health`
- `GET /v1/auth/me`
- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `GET /v1/gigs`
- `POST /v1/gigs`
- `GET /v1/applications`
- `POST /v1/applications`
