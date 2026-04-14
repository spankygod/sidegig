import type { Pool } from 'pg'
import type { PaymentStatus, PaymentSummary, PayoutStatus, PayoutSummary } from './types'

type PaymentRow = {
  id: string
  hire_id: string
  payer_id: string
  payee_id: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  provider_reference: string | null
  paid_at: Date | string
  refunded_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

type PayoutRow = {
  id: string
  hire_id: string
  payment_id: string
  worker_id: string
  amount: number
  currency: string
  status: PayoutStatus
  provider_reference: string | null
  paid_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapPayment (row: PaymentRow): PaymentSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    payerId: row.payer_id,
    payeeId: row.payee_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    provider: row.provider,
    providerReference: row.provider_reference,
    paidAt: toIsoString(row.paid_at),
    refundedAt: row.refunded_at == null ? null : toIsoString(row.refunded_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

function mapPayout (row: PayoutRow): PayoutSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    paymentId: row.payment_id,
    workerId: row.worker_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    providerReference: row.provider_reference,
    paidAt: row.paid_at == null ? null : toIsoString(row.paid_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

export async function recordHirePayment (
  db: Pool,
  input: {
    hireId: string
    payerId: string
    payeeId: string
    amount: number
    currency: string
    provider?: string
    providerReference?: string | null
  }
): Promise<PaymentSummary> {
  const result = await db.query<PaymentRow>(
    `
      insert into public.payments (
        hire_id,
        payer_id,
        payee_id,
        amount,
        currency,
        provider,
        provider_reference
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (hire_id) do update
        set updated_at = public.payments.updated_at
      returning
        id,
        hire_id,
        payer_id,
        payee_id,
        amount,
        currency,
        status,
        provider,
        provider_reference,
        paid_at,
        refunded_at,
        created_at,
        updated_at
    `,
    [
      input.hireId,
      input.payerId,
      input.payeeId,
      input.amount,
      input.currency,
      input.provider ?? 'manual',
      input.providerReference ?? null
    ]
  )

  return mapPayment(result.rows[0])
}

export async function listUserPayments (
  db: Pool,
  input: {
    userId: string
    limit?: number
  }
): Promise<PaymentSummary[]> {
  const result = await db.query<PaymentRow>(
    `
      select
        id,
        hire_id,
        payer_id,
        payee_id,
        amount,
        currency,
        status,
        provider,
        provider_reference,
        paid_at,
        refunded_at,
        created_at,
        updated_at
      from public.payments
      where payer_id = $1
        or payee_id = $1
      order by created_at desc
      limit $2
    `,
    [input.userId, input.limit ?? 50]
  )

  return result.rows.map(mapPayment)
}

export async function getUserPaymentById (
  db: Pool,
  input: {
    paymentId: string
    userId: string
  }
): Promise<PaymentSummary | null> {
  const result = await db.query<PaymentRow>(
    `
      select
        id,
        hire_id,
        payer_id,
        payee_id,
        amount,
        currency,
        status,
        provider,
        provider_reference,
        paid_at,
        refunded_at,
        created_at,
        updated_at
      from public.payments
      where id = $1
        and (payer_id = $2 or payee_id = $2)
    `,
    [input.paymentId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapPayment(result.rows[0])
}

export async function ensurePayoutForHire (
  db: Pool,
  hireId: string
): Promise<PayoutSummary | null> {
  const result = await db.query<PayoutRow>(
    `
      with eligible_payment as (
        select
          p.id as payment_id,
          p.hire_id,
          p.payee_id as worker_id,
          p.amount,
          p.currency
        from public.payments p
        inner join public.hires h on h.id = p.hire_id
        where p.hire_id = $1
          and p.status = 'paid'
          and h.status = 'payout_ready'
      ),
      inserted as (
        insert into public.payouts (
          hire_id,
          payment_id,
          worker_id,
          amount,
          currency
        )
        select
          hire_id,
          payment_id,
          worker_id,
          amount,
          currency
        from eligible_payment
        on conflict (hire_id) do update
          set updated_at = public.payouts.updated_at
        returning
          id,
          hire_id,
          payment_id,
          worker_id,
          amount,
          currency,
          status,
          provider_reference,
          paid_at,
          created_at,
          updated_at
      )
      select *
      from inserted
    `,
    [hireId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapPayout(result.rows[0])
}

export async function listAdminPayments (
  db: Pool,
  input: {
    status?: PaymentStatus
    limit?: number
  }
): Promise<PaymentSummary[]> {
  const values: Array<string | number> = []
  const conditions: string[] = []

  if (input.status != null) {
    values.push(input.status)
    conditions.push(`status = $${values.length}::public.payment_status`)
  }

  values.push(input.limit ?? 50)

  const result = await db.query<PaymentRow>(
    `
      select
        id,
        hire_id,
        payer_id,
        payee_id,
        amount,
        currency,
        status,
        provider,
        provider_reference,
        paid_at,
        refunded_at,
        created_at,
        updated_at
      from public.payments
      ${conditions.length === 0 ? '' : `where ${conditions.join(' and ')}`}
      order by created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapPayment)
}

export async function listAdminPayouts (
  db: Pool,
  input: {
    status?: PayoutStatus
    limit?: number
  }
): Promise<PayoutSummary[]> {
  const values: Array<string | number> = []
  const conditions: string[] = []

  if (input.status != null) {
    values.push(input.status)
    conditions.push(`status = $${values.length}::public.payout_status`)
  }

  values.push(input.limit ?? 50)

  const result = await db.query<PayoutRow>(
    `
      select
        id,
        hire_id,
        payment_id,
        worker_id,
        amount,
        currency,
        status,
        provider_reference,
        paid_at,
        created_at,
        updated_at
      from public.payouts
      ${conditions.length === 0 ? '' : `where ${conditions.join(' and ')}`}
      order by created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapPayout)
}

export async function markPayoutPaid (
  db: Pool,
  input: {
    payoutId: string
    providerReference?: string | null
  }
): Promise<PayoutSummary | null> {
  const client = await db.connect()

  try {
    await client.query('begin')

    const payoutResult = await client.query<PayoutRow>(
      `
        update public.payouts
        set
          status = 'paid',
          provider_reference = $2,
          paid_at = now()
        where id = $1
          and status = 'pending'
        returning
          id,
          hire_id,
          payment_id,
          worker_id,
          amount,
          currency,
          status,
          provider_reference,
          paid_at,
          created_at,
          updated_at
      `,
      [input.payoutId, input.providerReference ?? null]
    )

    if (payoutResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    await client.query(
      `
        update public.hires
        set status = 'paid_out'
        where id = $1
      `,
      [payoutResult.rows[0].hire_id]
    )

    await client.query('commit')

    return mapPayout(payoutResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function markPaymentRefunded (
  db: Pool,
  input: {
    paymentId: string
    providerReference?: string | null
  }
): Promise<PaymentSummary | null> {
  const client = await db.connect()

  try {
    await client.query('begin')

    const paymentResult = await client.query<PaymentRow>(
      `
        update public.payments
        set
          status = 'refunded',
          provider_reference = coalesce($2, provider_reference),
          refunded_at = coalesce(refunded_at, now())
        where id = $1
        returning
          id,
          hire_id,
          payer_id,
          payee_id,
          amount,
          currency,
          status,
          provider,
          provider_reference,
          paid_at,
          refunded_at,
          created_at,
          updated_at
      `,
      [input.paymentId, input.providerReference ?? null]
    )

    if (paymentResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const payment = paymentResult.rows[0]

    await client.query(
      `
        update public.hires
        set status = 'refunded'
        where id = $1
      `,
      [payment.hire_id]
    )

    await client.query(
      `
        update public.gig_posts gp
        set status = 'cancelled'
        from public.hires h
        where h.id = $1
          and h.gig_id = gp.id
          and gp.status <> 'cancelled'
      `,
      [payment.hire_id]
    )

    await client.query(
      `
        update public.payouts
        set
          status = 'cancelled',
          provider_reference = null,
          paid_at = null
        where hire_id = $1
          and status <> 'cancelled'
      `,
      [payment.hire_id]
    )

    await client.query('commit')

    return mapPayment(payment)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
