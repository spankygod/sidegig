# Raket MVP Spec

## Product summary

Raket is a side hustle marketplace where posters publish fixed-price jobs, workers apply, and both sides communicate inside the app before the poster funds a hire. The product goal is simple: keep trust, hiring, payment, and resolution inside the platform.

## User roles

- `User`: one account that can post gigs and apply to gigs
- `Poster`: creates posts, reviews applicants, funds a hire, accepts or disputes completion
- `Worker`: applies to gigs, chats with the poster, accepts the funded hire, completes work, and receives payout
- `Admin`: moderates content, resolves disputes, manages refunds, and approves payouts

## Non-negotiable product rules

- Pre-hire chat is allowed inside the app.
- Personal contact details are hidden before hire.
- Exact location is hidden before hire.
- Exact location unlocks when the poster funds the hire.
- Reviews are only allowed after a completed funded job.
- Jobs are fixed-price only in MVP.
- English only in MVP.
- The app uses funded bookings and milestone payments, not legal escrow terminology.

## User-facing flows

### 1. Poster creates a gig

Required fields:

- Title
- Category
- Description
- Price
- Expected duration bucket
- City or barangay
- Google Maps pin
- Preferred schedule or availability window

Validation rules:

- Price must be fixed
- Description must not contain contact details or external links
- Category must be in the allowed launch-safe set
- `Construction helper` posts must also include:
- On-site supervisor present
- PPE provided
- Helper-only task confirmation
- Expected physical load
- Start and end time

### 2. Worker applies

Required fields:

- Intro
- Availability

Worker can also view:

- Poster rating
- Poster completed jobs
- Poster response rate
- General area

Worker cannot view:

- Poster phone
- Poster email
- Poster exact address
- Poster exact map pin

### 3. Poster reviews applicants

Poster can:

- Accept chat requests implicitly through the application thread
- Review applicants
- Reject applicants
- View worker rating, completed jobs, response rate, skills, intro, and general area

Poster cannot view:

- Worker phone
- Worker email
- Worker social links
- External contact details in free text

### 4. Pre-hire chat

Pre-hire chat is enabled per application thread.

Rules:

- Chat exists inside the application thread only
- Basic masking blocks obvious phone numbers, emails, and URLs
- Users can discuss scope, schedule, and questions
- Users cannot unlock exact location or identity details before funding

### 5. Poster funds the hire

Poster selects one applicant and pays through PayMongo.

Result:

- Gig becomes `Funded`
- Selected application becomes `Hired`
- Exact location unlocks for the hired worker
- Other applicants are marked `Closed`

### 6. Worker accepts and completes

Worker can:

- Accept the funded hire
- View the exact map pin
- Mark the work as done

### 7. Poster accepts or disputes

After worker completion:

- Poster can accept completion
- Poster can open a dispute
- If no action is taken within the defined review window, the job can auto-transition for admin payout readiness

### 8. Reviews

Reviews unlock only when:

- A funded job was completed
- The job was accepted or resolved by admin

## Launch-safe categories

- Errands and personal assistance
- Cleaning and home help
- Moving help
- Construction helper
- Tutoring and academic support
- Graphic design and creative work
- Photo and video support
- Virtual assistance and admin work
- Event staffing

## Core data entities

- User
- UserProfile
- GigPost
- GigLocation
- GigApplication
- ChatThread
- ChatMessage
- Hire
- FundingIntent
- Payment
- Milestone
- Dispute
- Review
- AdminAction
- PayoutRequest
- Notification

## Status model

### Gig post status

- `draft`
- `published`
- `funded`
- `in_progress`
- `completed`
- `disputed`
- `cancelled`
- `closed`

### Application status

- `submitted`
- `rejected`
- `withdrawn`
- `hired`
- `closed`

### Hire status

- `pending_funding`
- `funded`
- `accepted`
- `in_progress`
- `worker_marked_done`
- `poster_accepted`
- `disputed`
- `refunded`
- `payout_ready`
- `paid_out`

## Mobile MVP screens

- Splash and onboarding
- Sign up and sign in
- Home feed
- Search and filter gigs
- Gig detail
- Apply to gig
- Post a gig
- Edit gig
- Applicants list
- Application thread chat
- Select applicant and fund hire
- My jobs
- Hired job detail
- Completion and dispute state
- Reviews
- Profile
- Notifications

## Expo implementation order

The Expo app should not try to ship every screen at once.

Recommended order:

1. Live shell: feed, search, backend connection, and profile bootstrap
2. Auth and worker setup
3. Gig detail, apply flow, and post gig flow
4. Applicants list and review flow
5. Application thread chat
6. Fund hire and hired-job detail
7. Completion, disputes, and reviews

## Admin MVP screens

- Admin login
- Dashboard summary
- User search
- Gig moderation queue
- Disputes queue
- Payment and refund queue
- Payout queue
- Reported content queue
- Category and content policy settings

## Out of scope for MVP

- Skilled or hazardous construction work
- Worker KYC
- Hourly jobs
- Open bidding
- Group chat
- Video or voice chat
- Attachments in applications
- Advanced anti-evasion enforcement
- Public exact address display
- Subscription plans
- Automated worker payout orchestration

