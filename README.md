# Raket

Raket is a Philippines-first side hustle marketplace. Posters publish fixed-price gigs, workers apply, both sides chat inside the app, and the platform keeps the transaction contained until the poster funds the hire.

The MVP is intentionally strict about privacy and transaction capture:

- Users can chat before hire, but personal contact details stay hidden.
- Exact location stays hidden until the poster funds the hire.
- Payment is modeled as a funded booking, not legal escrow.
- Jobs longer than 7 days use milestones instead of a single authorization hold.
- Reviews unlock only after a funded job is completed.

## Product decisions locked in

- Launch market: Philippines only
- Client app: Flutter mobile
- Roles: single account, dual role (poster and worker)
- Job pricing: fixed price only
- Matching: application-based
- Pre-hire chat: yes
- Pre-hire identity reveal: no
- KYC: not in MVP
- Monetization: free for MVP, optional poster-side fee later
- Payouts: admin-managed for MVP
- Language: English only

## Repo layout

- `mobile/`: Flutter client for posters and workers
- `backend/`: API, business logic, payments, chat, moderation, and admin auth
- `admin-dashboard/`: internal operations panel for disputes, payouts, moderation, and support
- `landing/`: public marketing site and waitlist/SEO surface
- `supabase/`: SQL migrations and Supabase-specific database setup
- `docs/`: product, payment, and architecture decisions

## Recommended stack

- Mobile: Flutter, Riverpod, GoRouter, Dio, Firebase Cloud Messaging
- Backend: TypeScript, Fastify, Supabase Auth, Supabase Postgres, Redis, WebSocket chat
- Admin dashboard: Next.js with TypeScript
- Landing: Next.js with TypeScript
- Storage: S3-compatible object storage for avatars and optional future attachments
- Maps: Google Maps for post location pinning and rough-area previews
- Payments: PayMongo for collection and refunds, admin-managed payout workflow for MVP

## Default library preferences

These are the default libraries for this repo unless there is a clear technical reason not to use them.

- Validation: `zod`
- React forms: `react-hook-form`
- React data fetching and caching: `@tanstack/react-query`
- React UI: `shadcn/ui`
- React animation: `motion`
- Date utilities: `date-fns`
- React client state: `zustand`
- Next.js search params: `nuqs`
- Charts: `recharts`

Important exceptions:

- `tRPC` is not a repo-wide default because the main client is Flutter. The backend contract should stay `REST/OpenAPI` so both Flutter and React apps can consume it cleanly.
- React-specific libraries do not apply to `mobile/`. Flutter should use native Dart and Flutter equivalents instead.

## Core marketplace rule

Raket should reveal enough information to support hiring decisions while preventing users from taking the transaction off-platform before a paid hire exists.

Visible before hire:

- Display name
- Rating and review count
- Jobs completed
- Response rate
- Skills
- Intro
- General area such as city or barangay

Hidden before hire:

- Full legal name
- Phone number
- Email
- Social handles
- Exact address
- Exact map pin
- External links
- Free text containing obvious contact details

## Launch-safe categories

The MVP should start with a safer set of categories instead of allowing everything:

- Errands and personal assistance
- Cleaning and home help
- Moving help
- Construction helper
- Tutoring and academic support
- Graphic design and creative work
- Photo and video support
- Virtual assistance and admin work
- Event staffing

Explicitly out of scope at launch:

- Illegal or restricted goods
- Adult services
- Medical or healthcare work
- Childcare
- Lending and debt collection
- Firearms and weapons
- Licensed trade work that needs formal credentials
- Skilled construction trade work
- High-risk construction work
- Electrical, plumbing, welding, roofing, demolition, excavation, and heavy machinery work

## MVP payment rule

The app should avoid the word `escrow` for MVP. Use `Funded`, `Protected Payment`, or `Milestone Payment`.

- Jobs up to 7 days: single funded booking
- Jobs from 8 to 14 days: two milestones
- Jobs longer than 14 days: weekly milestones
- Refunds and disputes are handled by admin
- Worker payouts are admin-managed until compliance and automation are clarified

See [docs/mvp-spec.md](/d:/GithubProjects/Raket/docs/mvp-spec.md), [docs/payment-and-disputes.md](/d:/GithubProjects/Raket/docs/payment-and-disputes.md), and [docs/architecture.md](/d:/GithubProjects/Raket/docs/architecture.md) for the detailed operating model.

## Build order

1. Backend foundation: auth, users, gigs, applications, chat, payments, admin
2. Flutter mobile MVP: auth, feed, post gig, apply, chat, fund hire, my jobs
3. Admin dashboard: disputes, refunds, payouts, moderation, support
4. Landing site: waitlist, SEO pages, and product explanation
