# Raket Feature List

Manual review checklist for the current backend completion pass.

## Route Boundary Rule

- [x] Mobile app routes use `/v1/...`.
- [x] Admin dashboard routes use `/admin/v1/...`.
- [x] Admin-dashboard should not depend on mobile route response shapes.
- [x] Mobile should not call admin routes.
- [x] Shared logic lives in `backend/src/modules/*`.

## Backend Foundation

- [x] Supabase-authenticated request context.
- [x] User profile creation and profile update.
- [x] User stats table for rating, review count, jobs completed, and response rate.
- [x] Drizzle schema and SQL migrations under `backend/drizzle/migrations`.
- [x] TypeScript build-based backend verification.
- [x] Node test runner wired into `npm test`.

Mobile routes:

- `GET /v1/auth/me`
- `GET /v1/users/me`
- `PATCH /v1/users/me`

## Gigs

- [x] Public gig browsing with location-safe response data.
- [x] Public gig detail route.
- [x] Poster gig list and detail routes.
- [x] Poster gig creation.
- [x] Poster gig update with lifecycle restrictions.
- [x] Construction-helper validation requirements.
- [x] Distance and service-radius eligibility checks.
- [x] Close/cancel behavior closes open applications.

Mobile routes:

- `GET /v1/gigs`
- `GET /v1/gigs/:gigId`
- `GET /v1/gigs/mine`
- `GET /v1/gigs/mine/:gigId`
- `POST /v1/gigs`
- `PATCH /v1/gigs/mine/:gigId`

## Applications

- [x] Worker application creation.
- [x] Worker application list.
- [x] Worker application detail.
- [x] Worker application withdrawal.
- [x] Poster applicant list per gig.
- [x] Poster application review/reject route.
- [x] Duplicate application conflict handling.

Mobile routes:

- `GET /v1/applications`
- `POST /v1/applications`
- `GET /v1/applications/:applicationId`
- `POST /v1/applications/:applicationId/withdraw`
- `GET /v1/gigs/mine/:gigId/applications`
- `PATCH /v1/gigs/mine/:gigId/applications/:applicationId`

## Hire Lifecycle

- [x] Poster selects applicant and funds hire.
- [x] Worker accepts funded hire.
- [x] Worker marks hire in progress.
- [x] Worker marks work done.
- [x] Poster accepts completion.
- [x] Poster disputes completion.
- [x] Hired participants can read hire detail.
- [x] Exact gig location unlocks only for hired participants.

Mobile routes:

- `POST /v1/gigs/mine/:gigId/fund`
- `GET /v1/hires`
- `GET /v1/hires/:hireId`
- `GET /v1/hires/:hireId/work-detail`
- `POST /v1/hires/:hireId/accept`
- `POST /v1/hires/:hireId/start`
- `POST /v1/hires/:hireId/mark-done`
- `POST /v1/hires/:hireId/accept-completion`
- `POST /v1/hires/:hireId/dispute`

## Chat

- [x] Application chat threads.
- [x] Hire chat threads.
- [x] Participant-only message reads.
- [x] Participant-only message creation.
- [x] Contact-detail rejection in message bodies.
- [x] Chat message notification creation.

Mobile routes:

- `GET /v1/chat/threads`
- `POST /v1/chat/applications/:applicationId/thread`
- `POST /v1/chat/hires/:hireId/thread`
- `GET /v1/chat/threads/:threadId/messages`
- `POST /v1/chat/threads/:threadId/messages`

## Moderation

- [x] Shared contact-detail detection policy.
- [x] Chat messages reject emails, external links, and obvious phone numbers.
- [x] Gig content uses the same moderation policy.
- [x] Applications use the same moderation policy.
- [x] Disputes use the same moderation policy.
- [x] Reviews use the same moderation policy.
- [x] Profile edits use the same moderation policy.
- [x] Unit tests cover the moderation policy.

## Disputes

- [x] Disputes table and status enum.
- [x] Poster can open dispute after worker marks done.
- [x] Opening dispute moves hire and gig to disputed.
- [x] Poster and worker can list related disputes.
- [x] Poster and worker can read related dispute detail.

Mobile routes:

- `GET /v1/disputes`
- `GET /v1/disputes/:disputeId`

Admin routes:

- `GET /admin/v1/disputes`

## Reviews And Stats

- [x] Reviews table.
- [x] Completed hire participants can review each other once.
- [x] Public user profile route.
- [x] Public user reviews route.
- [x] Review creation refreshes user rating and review count.
- [x] Completion increments worker jobs completed.

Mobile routes:

- `GET /v1/users/:userId`
- `GET /v1/users/:userId/reviews`
- `POST /v1/hires/:hireId/review`

## Notifications

- [x] In-app notifications table.
- [x] User notification list.
- [x] Mark one notification read.
- [x] Mark all notifications read.
- [x] Notifications are created for applications, application review, hires, chat, disputes, reviews, and milestones.

Mobile routes:

- `GET /v1/notifications`
- `POST /v1/notifications/:notificationId/read`
- `POST /v1/notifications/read-all`

## Milestones

- [x] Hire milestones table and status enum.
- [x] Poster can create milestones for active hires.
- [x] Hire participants can list milestones.
- [x] Hire participants can update milestone status.
- [x] Only poster can cancel milestones.
- [x] Milestone changes create notifications.

Mobile routes:

- `GET /v1/hires/:hireId/milestones`
- `POST /v1/hires/:hireId/milestones`
- `POST /v1/hires/:hireId/milestones/:milestoneId/status`

## Payments And Payouts

- [x] Payment records table.
- [x] Payout records table.
- [x] Funding a hire records a payment.
- [x] Poster accepting completion moves hire through payout-ready.
- [x] Payout record is created for payout-ready hire.
- [x] Users can list and read related payments.
- [x] Admin can list payments.
- [x] Admin can list payouts.
- [x] Admin can mark payout paid.
- [x] Mock PayMongo checkout succeeds after hire funding eligibility passes.
- [x] Mock PayMongo webhook verification always succeeds.
- [x] Mock PayMongo webhook handler always accepts events.
- [x] Mock PayMongo refund succeeds for existing payments.
- [x] Mock admin-triggered refunds update payment, hire, gig, and payout state.
- [x] Mock worker payout rail succeeds for eligible payout-ready hires.

Mobile routes:

- `GET /v1/payments`
- `GET /v1/payments/:paymentId`

Admin routes:

- `GET /admin/v1/payments`
- `POST /admin/v1/payments/:paymentId/refund`
- `GET /admin/v1/payouts`
- `POST /admin/v1/payouts/:payoutId/mark-paid`

Not yet wired:

- [x] Mock PayMongo checkout/session creation after hire funding eligibility passes.
- [x] Mock PayMongo webhook verification and event handling.
- [x] Mock PayMongo refunds for existing payments.
- [x] Mock worker payout rail for eligible payout-ready hires.
- [x] Mock payout rail marks the hire paid out.
- [ ] Real PayMongo checkout/session creation.
- [ ] Real PayMongo webhook verification and event handling.
- [ ] Real automated refunds.
- [ ] Real automated worker payout rail.

Webhook routes:

- `POST /webhooks/paymongo`

## Admin Dashboard Backend

- [x] Admin auth guard using `ADMIN_USER_IDS`.
- [x] Admin overview route.
- [x] Admin gig queue route.
- [x] Admin dispute queue route.
- [x] Admin payment queue route.
- [x] Admin payout queue route.

Admin routes:

- `GET /admin/v1/overview`
- `GET /admin/v1/gigs`
- `GET /admin/v1/disputes`
- `GET /admin/v1/payments`
- `POST /admin/v1/payments/:paymentId/refund`
- `GET /admin/v1/payouts`
- `POST /admin/v1/payouts/:payoutId/mark-paid`

## Testing

- [x] `npm test` runs TypeScript build.
- [x] `npm test` runs Node unit tests from compiled output.
- [x] Moderation policy tests exist.

Current command:

```bash
cd backend
npm test
```

## Manual Review Focus

- [ ] Confirm the mobile app should call only `/v1/...` routes.
- [ ] Confirm admin-dashboard should call only `/admin/v1/...` routes.
- [ ] Confirm payment MVP should remain mock-provider until real PayMongo is wired.
- [ ] Confirm dispute statuses and admin payout workflow match operations.
- [ ] Confirm milestone behavior is enough for MVP or should be hidden until later.
