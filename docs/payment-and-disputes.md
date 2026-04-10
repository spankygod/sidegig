# Payment And Dispute Model

## Why the MVP should not use escrow language

Raket can use PayMongo to collect payment and issue refunds, but the MVP should avoid presenting the product as a formal escrow service. The product language should stay with:

- `Funded`
- `Protected Payment`
- `Milestone Payment`

This is the safest operating model while payout automation and compliance are still immature.

## Funding model

### Jobs up to 7 days

- Poster funds the full amount when hiring
- Payment is collected through PayMongo
- Job moves to `Funded`
- Exact map pin unlocks for the hired worker

### Jobs from 8 to 14 days

- Job is split into two milestones
- First milestone is paid at hire
- Second milestone is funded before the second work window starts

### Jobs longer than 14 days

- Job is split into weekly milestones
- Each milestone is separately funded and tracked
- Each milestone has its own acceptance or dispute event

## Review window

Recommended MVP rule:

- Worker marks milestone or job as done
- Poster gets 24 hours to accept or dispute
- If the poster does nothing, the job or milestone moves to `payout_ready`

## Dispute categories

- Worker no-show
- Poster no-show
- Incomplete work
- Poor quality
- Work not matching scope
- Late completion
- Fraud or abusive behavior

## Dispute outcomes

- Full refund to poster
- Partial refund to poster and partial payout to worker
- Full payout to worker
- Warning or account restriction on either side

## Admin payout model for MVP

The MVP uses admin-managed payouts.

Recommended operational flow:

1. Poster funds the job through PayMongo.
2. The platform records the payment and hire.
3. Worker completes the job.
4. Poster accepts or disputes.
5. Admin reviews edge cases or automatic payout-ready jobs.
6. Admin releases payout through the chosen operational rail and records the payout reference inside Raket.

## Refund rules

- If no worker is hired, poster can cancel and receive a refund based on payment state
- If worker never accepts, admin can void or refund
- If dispute favors poster, admin issues full or partial refund through PayMongo
- If dispute favors worker, admin marks payout as approved

## Recommended future monetization

Do not charge for posting in MVP.

When monetization starts:

- Add a poster-side service fee at hire
- Keep worker payout simple at first
- Add promoted or urgent gig boosts only after the marketplace has real demand

