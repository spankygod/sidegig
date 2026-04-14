# Expo Mobile Roadmap

## Current direction

Raket's mobile client is now `mobile/`, built with Expo and React Native.

The near-term goal is not to build every MVP screen at once. The goal is to ship the mobile app in layers that match the backend foundation already in the repo.

## Phase 1: Live shell

Purpose: replace template UI with a real Raket app shell and prove backend connectivity.

Deliverables:

- Expo Router tab shell
- Branded feed screen
- Live marketplace search screen backed by `GET /v1/gigs`
- Profile connection screen backed by `GET /v1/auth/me` and `GET /v1/users/me`
- Configurable API base URL for local development

## Phase 2: Auth and worker setup

Purpose: remove manual token entry and establish a usable account flow through Supabase Auth.

Deliverables:

- Sign up and sign in screens
- Supabase Google sign-in
- Supabase session persistence in the Expo app
- Profile onboarding for display name, skills, city, barangay, and service radius
- Worker location setup for proximity-based eligibility

## Phase 3: Marketplace core

Purpose: make the app useful for posters and workers before payments.

Deliverables:

- Gig detail screen
- Apply to gig flow
- Post a gig flow
- My applications view
- Poster applicants list
- Review and reject actions

## Phase 4: Pre-hire trust flow

Purpose: keep hiring conversations inside the app.

Deliverables:

- Application thread chat
- Contact-detail masking
- Availability and scope discussion inside application threads
- Poster and worker state badges for submitted, rejected, hired, and closed

## Phase 5: Funded hire flow

Purpose: move from matching to protected transactions.

Deliverables:

- Select applicant and fund hire
- Hire status tracking
- Exact location unlock only for hired worker
- My jobs and hired job detail screens

## Phase 6: Completion, disputes, and reviews

Purpose: close the operational loop safely.

Deliverables:

- Worker marked done flow
- Poster accept or dispute flow
- Review submission and display
- Dispute state and admin resolution visibility

## Backend dependencies

The current Expo shell already depends on:

- `GET /health`
- `GET /v1/gigs`
- `GET /v1/auth/me`
- `GET /v1/users/me`

The next mobile phases require backend support for:

- Supabase bearer token validation on protected API routes
- Gig detail endpoint
- Application create/list/status actions
- Applicant review actions
- Chat threads and messages
- Hire funding and status transitions
- Reviews, disputes, and notifications
