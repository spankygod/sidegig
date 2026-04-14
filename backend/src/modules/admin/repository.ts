import type { Pool } from 'pg'
import type { AdminDisputeSummary, AdminGigSummary, AdminOverview } from './types'

type AdminOverviewRow = {
  users: string | number
  published_gigs: string | number
  total_gigs: string | number
  applications: string | number
  active_hires: string | number
  open_disputes: string | number
}

type AdminGigRow = {
  id: string
  poster_id: string
  poster_display_name: string
  title: string
  category: string
  status: string
  city: string
  barangay: string
  price_amount: number
  currency: string
  created_at: Date | string
  updated_at: Date | string
}

type AdminDisputeRow = {
  id: string
  hire_id: string
  opened_by: string
  poster_id: string
  worker_id: string
  reason: string
  status: string
  created_at: Date | string
  updated_at: Date | string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function toNumber (value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

function mapAdminGig (row: AdminGigRow): AdminGigSummary {
  return {
    id: row.id,
    posterId: row.poster_id,
    posterDisplayName: row.poster_display_name,
    title: row.title,
    category: row.category,
    status: row.status,
    city: row.city,
    barangay: row.barangay,
    priceAmount: row.price_amount,
    currency: row.currency,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

function mapAdminDispute (row: AdminDisputeRow): AdminDisputeSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    openedBy: row.opened_by,
    posterId: row.poster_id,
    workerId: row.worker_id,
    reason: row.reason,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

export async function getAdminOverview (db: Pool): Promise<AdminOverview> {
  const result = await db.query<AdminOverviewRow>(
    `
      select
        (select count(*) from public.profiles) as users,
        (select count(*) from public.gig_posts where status = 'published') as published_gigs,
        (select count(*) from public.gig_posts) as total_gigs,
        (select count(*) from public.gig_applications) as applications,
        (select count(*) from public.hires where status in ('funded', 'accepted', 'in_progress', 'worker_marked_done')) as active_hires,
        (select count(*) from public.disputes where status in ('open', 'under_review')) as open_disputes
    `
  )

  const row = result.rows[0]

  return {
    users: toNumber(row.users),
    publishedGigs: toNumber(row.published_gigs),
    totalGigs: toNumber(row.total_gigs),
    applications: toNumber(row.applications),
    activeHires: toNumber(row.active_hires),
    openDisputes: toNumber(row.open_disputes)
  }
}

export async function listAdminGigs (
  db: Pool,
  input: {
    status?: string
    limit?: number
  }
): Promise<AdminGigSummary[]> {
  const values: Array<string | number> = []
  const conditions: string[] = []

  if (input.status != null) {
    values.push(input.status)
    conditions.push(`g.status = $${values.length}::public.gig_status`)
  }

  values.push(input.limit ?? 50)

  const result = await db.query<AdminGigRow>(
    `
      select
        g.id,
        g.poster_id,
        p.display_name as poster_display_name,
        g.title,
        g.category,
        g.status,
        g.city,
        g.barangay,
        g.price_amount,
        g.currency,
        g.created_at,
        g.updated_at
      from public.gig_posts g
      inner join public.profiles p on p.id = g.poster_id
      ${conditions.length === 0 ? '' : `where ${conditions.join(' and ')}`}
      order by g.created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapAdminGig)
}

export async function listAdminDisputes (
  db: Pool,
  input: {
    status?: string
    limit?: number
  }
): Promise<AdminDisputeSummary[]> {
  const values: Array<string | number> = []
  const conditions: string[] = []

  if (input.status != null) {
    values.push(input.status)
    conditions.push(`status = $${values.length}::public.dispute_status`)
  }

  values.push(input.limit ?? 50)

  const result = await db.query<AdminDisputeRow>(
    `
      select
        id,
        hire_id,
        opened_by,
        poster_id,
        worker_id,
        reason,
        status,
        created_at,
        updated_at
      from public.disputes
      ${conditions.length === 0 ? '' : `where ${conditions.join(' and ')}`}
      order by created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapAdminDispute)
}
