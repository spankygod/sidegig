# Backend API Status

This document is the current backend contract checkpoint after the backend completion pass.

## Route Boundaries

- Mobile app routes live under `/v1/...`.
- Admin dashboard routes live under `/admin/v1/...`.
- Mobile should not call `/admin/v1/...`.
- Admin-dashboard should not depend on mobile route response shapes for operational workflows.
- Shared business rules live under `backend/src/modules/*`.

## Mobile Routes

- `GET /v1/auth/me`
- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `GET /v1/users/:userId`
- `GET /v1/users/:userId/reviews`
- `GET /v1/gigs`
- `GET /v1/gigs/:gigId`
- `GET /v1/gigs/mine`
- `GET /v1/gigs/mine/:gigId`
- `POST /v1/gigs`
- `PATCH /v1/gigs/mine/:gigId`
- `GET /v1/gigs/mine/:gigId/applications`
- `PATCH /v1/gigs/mine/:gigId/applications/:applicationId`
- `POST /v1/gigs/mine/:gigId/fund`
- `GET /v1/applications`
- `POST /v1/applications`
- `GET /v1/applications/:applicationId`
- `POST /v1/applications/:applicationId/withdraw`
- `GET /v1/hires`
- `GET /v1/hires/:hireId`
- `GET /v1/hires/:hireId/work-detail`
- `GET /v1/hires/:hireId/milestones`
- `POST /v1/hires/:hireId/milestones`
- `POST /v1/hires/:hireId/milestones/:milestoneId/status`
- `POST /v1/hires/:hireId/accept`
- `POST /v1/hires/:hireId/start`
- `POST /v1/hires/:hireId/mark-done`
- `POST /v1/hires/:hireId/accept-completion`
- `POST /v1/hires/:hireId/dispute`
- `POST /v1/hires/:hireId/review`
- `GET /v1/chat/threads`
- `POST /v1/chat/applications/:applicationId/thread`
- `POST /v1/chat/hires/:hireId/thread`
- `GET /v1/chat/threads/:threadId/messages`
- `POST /v1/chat/threads/:threadId/messages`
- `GET /v1/disputes`
- `GET /v1/disputes/:disputeId`
- `GET /v1/notifications`
- `POST /v1/notifications/:notificationId/read`
- `POST /v1/notifications/read-all`
- `GET /v1/payments`
- `GET /v1/payments/:paymentId`

## Webhook Routes

- `POST /webhooks/paymongo`

## Admin Routes

Admin routes require `ADMIN_USER_IDS` to include the authenticated Supabase user id.

- `GET /admin/v1/overview`
- `GET /admin/v1/gigs`
- `GET /admin/v1/disputes`
- `GET /admin/v1/payments`
- `POST /admin/v1/payments/:paymentId/refund`
- `GET /admin/v1/payouts`
- `POST /admin/v1/payouts/:payoutId/mark-paid`

## Implemented Backend Capabilities

- Gig browsing, posting, editing, applicant review, and hire funding.
- Application detail and withdrawal.
- Hire lifecycle: accept, start, worker done, poster accept, poster dispute.
- Exact work detail unlock for hired participants only.
- Chat threads and messages for applications and hires.
- Shared contact-detail moderation across chat, gigs, applications, disputes, reviews, and profile edits.
- Dispute intake records and participant read routes.
- Reviews and public user stats.
- In-app notification storage and read state.
- Hire milestones.
- Payment records and payout records.
- Admin route foundation with admin-only overview, gig, dispute, payment, and payout queues.

## Operational Notes

- PayMongo behavior is currently mocked: checkout passes after hire funding eligibility, webhook verification always accepts events, admin-triggered refunds pass for existing payments, and eligible worker payouts are auto-marked paid with mock provider references.
- Real PayMongo checkout, webhook verification, refunds, and payout rails are not wired yet.
- `npm test` runs TypeScript build plus Node unit tests.
- SQL migrations live in `backend/drizzle/migrations`.
