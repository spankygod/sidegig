# Architecture

## Monorepo shape

- `mobile/`: Expo React Native app used by posters and workers
- `backend/`: API, websocket chat, background jobs, and business rules
- `admin-dashboard/`: internal operations tool
- `landing/`: public website

## Recommended technical stack

### Mobile

- Expo
- React Native
- Expo Router for navigation
- TanStack Query for server-state and cache management
- Zustand for lightweight client state
- Supabase Auth client for session handling
- Expo Notifications for push notifications when needed
- React Native and Expo-native libraries instead of web-only UI tooling

### Backend

- TypeScript
- Fastify
- Supabase Auth for identity and access tokens
- Supabase Postgres for the primary relational database
- WebSocket transport for chat and live updates
- `zod` for runtime validation where shared schemas are useful
- `REST/OpenAPI` as the API contract for Expo mobile and web clients

### Admin dashboard

- Next.js
- TypeScript
- Server-side auth guard tied to backend admin roles
- `zod`
- `react-hook-form`
- `@tanstack/react-query`
- `shadcn/ui`
- `motion`
- `date-fns`
- `zustand`
- `nuqs`
- `recharts`

### Landing

- Next.js
- TypeScript
- Static and server-rendered marketing pages
- `zod`
- `react-hook-form` when forms are needed
- `@tanstack/react-query` only if dynamic app-like data is required
- `shadcn/ui`
- `motion`
- `date-fns`
- `zustand` only when shared client state is actually needed
- `nuqs`

## Backend modules

- `auth`: Supabase token verification, auth context, and backend authorization hooks
- `users`: profile, stats, dual-role support, visibility-safe fields
- `gigs`: create, update, publish, close, categories, duration buckets
- `applications`: apply, review, reject, hire selection
- `chat`: pre-hire and post-hire chat threads with masking
- `payments`: PayMongo integration, payment records, refunds
- `milestones`: long-running job payment segmentation
- `reviews`: post-completion ratings and comments
- `disputes`: dispute intake, evidence, resolution, outcome
- `admin`: moderation, payout queue, overrides, audit trail
- `notifications`: push and in-app notifications

## Backend route boundaries

User-facing mobile routes and admin-dashboard routes must stay separate.

- Mobile app routes live under `/v1/...`.
- Admin dashboard routes live under `/admin/v1/...`.
- Mobile routes must only expose user-safe poster/worker behavior and visibility-safe fields.
- Admin routes may expose operational fields, moderation data, dispute evidence, payout state, refund state, and audit metadata.
- The mobile app must not call `/admin/v1/...`.
- The admin dashboard must not depend on mobile route shapes for operational workflows; shared business logic should live in `src/modules/*`.
- Route handlers should stay thin. Put reusable rules in modules/repositories so mobile and admin routes can share business logic without sharing HTTP contracts.

## Frontend standards

- Use `zod` as the default schema and validation layer for React apps.
- Use `react-hook-form` for non-trivial React forms.
- Use `@tanstack/react-query` for React server-state and cache management.
- Use `shadcn/ui` as the default component baseline for React apps.
- Use `motion` for deliberate page and component animation.
- Use `date-fns` for date formatting and arithmetic.
- Use `zustand` for lightweight React client state when local component state is not enough.
- Use `nuqs` for typed Next.js search parameter state.
- Use `recharts` for admin analytics and operational charts.
- Do not use `tRPC` as the default API layer in this repo because Expo mobile is a first-class client.

## Initial database outline

### User-facing tables

- `auth.users`
- `profiles`
- `user_stats`
- `gig_posts`
- `gig_applications`
- `chat_threads`
- `chat_messages`
- `hires`
- `milestones`
- `reviews`
- `notifications`

### Financial and admin tables

- `payments`
- `refunds`
- `payouts`
- `disputes`
- `reports`
- `admin_actions`

## Privacy rules in the API

The backend should never trust the client to hide sensitive fields.

Before a funded hire:

- Response payloads should omit direct contact fields
- Profile serialization should only return public-safe fields
- Location endpoints should only return rough area data
- Chat message creation should reject obvious contact-sharing patterns

After a funded hire:

- Exact location can be revealed to the hired worker only
- Private hire thread permissions should be enforced server-side

## Suggested implementation order

1. Auth and user profiles
2. Gig creation and browsing
3. Applications and review flow
4. Chat with masking
5. Funding and hire state transitions
6. Reviews and dispute workflow
7. Admin moderation and payout queue
8. Landing site
