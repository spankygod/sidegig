import type { Pool } from 'pg'
import type { ChatMessageSummary, ChatThreadContext, ChatThreadSummary } from './types'

type ChatThreadRow = {
  id: string
  context_type: ChatThreadContext
  application_id: string | null
  hire_id: string | null
  poster_id: string
  worker_id: string
  created_at: Date | string
  updated_at: Date | string
}

type ChatMessageRow = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: Date | string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapThread (row: ChatThreadRow): ChatThreadSummary {
  return {
    id: row.id,
    contextType: row.context_type,
    applicationId: row.application_id,
    hireId: row.hire_id,
    posterId: row.poster_id,
    workerId: row.worker_id,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

function mapMessage (row: ChatMessageRow): ChatMessageSummary {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: toIsoString(row.created_at)
  }
}

export async function listUserChatThreads (
  db: Pool,
  userId: string
): Promise<ChatThreadSummary[]> {
  const result = await db.query<ChatThreadRow>(
    `
      select
        id,
        context_type,
        application_id,
        hire_id,
        poster_id,
        worker_id,
        created_at,
        updated_at
      from public.chat_threads
      where poster_id = $1
        or worker_id = $1
      order by updated_at desc, created_at desc
    `,
    [userId]
  )

  return result.rows.map(mapThread)
}

export async function ensureApplicationChatThread (
  db: Pool,
  input: {
    applicationId: string
    userId: string
  }
): Promise<ChatThreadSummary | null> {
  const result = await db.query<ChatThreadRow>(
    `
      with application_access as (
        select
          ga.id as application_id,
          g.poster_id,
          ga.worker_id
        from public.gig_applications ga
        inner join public.gig_posts g on g.id = ga.gig_id
        where ga.id = $1
          and (g.poster_id = $2 or ga.worker_id = $2)
          and ga.status not in ('withdrawn', 'closed')
      ),
      inserted as (
        insert into public.chat_threads (
          context_type,
          application_id,
          poster_id,
          worker_id
        )
        select
          'application',
          application_id,
          poster_id,
          worker_id
        from application_access
        on conflict (application_id) do update
          set updated_at = public.chat_threads.updated_at
        returning
          id,
          context_type,
          application_id,
          hire_id,
          poster_id,
          worker_id,
          created_at,
          updated_at
      )
      select *
      from inserted
    `,
    [input.applicationId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapThread(result.rows[0])
}

export async function ensureHireChatThread (
  db: Pool,
  input: {
    hireId: string
    userId: string
  }
): Promise<ChatThreadSummary | null> {
  const result = await db.query<ChatThreadRow>(
    `
      with hire_access as (
        select
          id as hire_id,
          poster_id,
          worker_id
        from public.hires
        where id = $1
          and (poster_id = $2 or worker_id = $2)
      ),
      inserted as (
        insert into public.chat_threads (
          context_type,
          hire_id,
          poster_id,
          worker_id
        )
        select
          'hire',
          hire_id,
          poster_id,
          worker_id
        from hire_access
        on conflict (hire_id) do update
          set updated_at = public.chat_threads.updated_at
        returning
          id,
          context_type,
          application_id,
          hire_id,
          poster_id,
          worker_id,
          created_at,
          updated_at
      )
      select *
      from inserted
    `,
    [input.hireId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapThread(result.rows[0])
}

export async function listThreadMessages (
  db: Pool,
  input: {
    limit: number
    threadId: string
    userId: string
  }
): Promise<ChatMessageSummary[] | null> {
  const accessResult = await db.query(
    `
      select 1
      from public.chat_threads
      where id = $1
        and (poster_id = $2 or worker_id = $2)
    `,
    [input.threadId, input.userId]
  )

  if (accessResult.rowCount === 0) {
    return null
  }

  const result = await db.query<ChatMessageRow>(
    `
      select
        id,
        thread_id,
        sender_id,
        body,
        created_at
      from public.chat_messages
      where thread_id = $1
      order by created_at desc
      limit $2
    `,
    [input.threadId, input.limit]
  )

  return result.rows.reverse().map(mapMessage)
}

export async function createThreadMessage (
  db: Pool,
  input: {
    body: string
    senderId: string
    threadId: string
  }
): Promise<ChatMessageSummary | null> {
  const client = await db.connect()

  try {
    await client.query('begin')

    const accessResult = await client.query(
      `
        select 1
        from public.chat_threads
        where id = $1
          and (poster_id = $2 or worker_id = $2)
        for update
      `,
      [input.threadId, input.senderId]
    )

    if (accessResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const messageResult = await client.query<ChatMessageRow>(
      `
        insert into public.chat_messages (
          thread_id,
          sender_id,
          body
        )
        values ($1, $2, $3)
        returning
          id,
          thread_id,
          sender_id,
          body,
          created_at
      `,
      [input.threadId, input.senderId, input.body]
    )

    await client.query(
      `
        update public.chat_threads
        set updated_at = now()
        where id = $1
      `,
      [input.threadId]
    )

    await client.query('commit')

    return mapMessage(messageResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
