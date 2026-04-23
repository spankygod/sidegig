import { supabase } from '@/lib/supabase-client'

type ChatThreadRow = {
  id: string
  context_type: 'application' | 'hire'
  application_id: string | null
  hire_id: string | null
  poster_id: string
  worker_id: string
  created_at: string
  updated_at: string
}

type ChatMessageRow = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

type ProfileRow = {
  id: string
  display_name: string
  city: string | null
}

type ApplicationRow = {
  id: string
  gig_id: string
}

type ApplicationBootstrapRow = {
  id: string
  gig_id: string
  worker_id: string
}

type HireRow = {
  id: string
  gig_id: string
}

type HireBootstrapRow = {
  id: string
  poster_id: string
  worker_id: string
}

type GigRow = {
  id: string
  title: string
}

type GigPosterRow = {
  id: string
  poster_id: string
}

type ExistingThreadContextRow = {
  application_id: string | null
  hire_id: string | null
}

export type ChatThreadContext = 'application' | 'hire'

export type ChatMessage = {
  id: string
  threadId: string
  senderId: string
  body: string
  createdAt: string
}

export type ChatInboxThread = {
  id: string
  applicationId: string | null
  hireId: string | null
  contextTitle: string | null
  contextType: ChatThreadContext
  createdAt: string
  lastMessageAt: string
  lastMessageBody: string | null
  lastMessageSenderId: string | null
  participantCity: string | null
  participantDisplayName: string
  participantId: string
  updatedAt: string
}

function ensureSupabaseData<T>(data: T | null, error: { message: string } | null): T {
  if (error != null) {
    throw new Error(error.message)
  }

  if (data == null) {
    throw new Error('Supabase returned no data.')
  }

  return data
}

function mapChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at
  }
}

function getOtherParticipantId(thread: ChatThreadRow, currentUserId: string): string {
  if (thread.poster_id === currentUserId) {
    return thread.worker_id
  }

  return thread.poster_id
}

async function fetchProfileMap(userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, city')
    .in('id', userIds)

  const rows = ensureSupabaseData(data as ProfileRow[] | null, error)

  return new Map(rows.map((row) => [row.id, row]))
}

async function fetchGigPosterMap(gigIds: string[]): Promise<Map<string, string>> {
  if (gigIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('gig_posts')
    .select('id, poster_id')
    .in('id', gigIds)

  const rows = ensureSupabaseData(data as GigPosterRow[] | null, error)

  return new Map(rows.map((row) => [row.id, row.poster_id]))
}

async function fetchRecentMessageMap(threadIds: string[]): Promise<Map<string, ChatMessageRow>> {
  if (threadIds.length === 0) {
    return new Map()
  }

  const recentLimit = Math.min(Math.max(threadIds.length * 4, 50), 200)
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, thread_id, sender_id, body, created_at')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: false })
    .limit(recentLimit)

  const rows = ensureSupabaseData(data as ChatMessageRow[] | null, error)
  const recentMessageMap = new Map<string, ChatMessageRow>()

  for (const row of rows) {
    if (!recentMessageMap.has(row.thread_id)) {
      recentMessageMap.set(row.thread_id, row)
    }
  }

  return recentMessageMap
}

async function fetchContextTitleMap(
  threads: ChatThreadRow[]
): Promise<{
  applicationTitles: Map<string, string>
  hireTitles: Map<string, string>
}> {
  const applicationIds = Array.from(new Set(
    threads
      .map((thread) => thread.application_id)
      .filter((value): value is string => value != null)
  ))

  const hireIds = Array.from(new Set(
    threads
      .map((thread) => thread.hire_id)
      .filter((value): value is string => value != null)
  ))

  const applicationToGigId = new Map<string, string>()
  const hireToGigId = new Map<string, string>()
  const gigIds = new Set<string>()

  if (applicationIds.length > 0) {
    const { data, error } = await supabase
      .from('gig_applications')
      .select('id, gig_id')
      .in('id', applicationIds)

    const rows = ensureSupabaseData(data as ApplicationRow[] | null, error)

    for (const row of rows) {
      applicationToGigId.set(row.id, row.gig_id)
      gigIds.add(row.gig_id)
    }
  }

  if (hireIds.length > 0) {
    const { data, error } = await supabase
      .from('hires')
      .select('id, gig_id')
      .in('id', hireIds)

    const rows = ensureSupabaseData(data as HireRow[] | null, error)

    for (const row of rows) {
      hireToGigId.set(row.id, row.gig_id)
      gigIds.add(row.gig_id)
    }
  }

  if (gigIds.size === 0) {
    return {
      applicationTitles: new Map(),
      hireTitles: new Map()
    }
  }

  const { data, error } = await supabase
    .from('gig_posts')
    .select('id, title')
    .in('id', Array.from(gigIds))

  const gigRows = ensureSupabaseData(data as GigRow[] | null, error)
  const gigTitleMap = new Map(gigRows.map((row) => [row.id, row.title]))
  const applicationTitles = new Map<string, string>()
  const hireTitles = new Map<string, string>()

  for (const [applicationId, gigId] of applicationToGigId.entries()) {
    const title = gigTitleMap.get(gigId)

    if (title != null) {
      applicationTitles.set(applicationId, title)
    }
  }

  for (const [hireId, gigId] of hireToGigId.entries()) {
    const title = gigTitleMap.get(gigId)

    if (title != null) {
      hireTitles.set(hireId, title)
    }
  }

  return {
    applicationTitles,
    hireTitles
  }
}

export async function ensureChatThreadsForCurrentUser(currentUserId: string): Promise<void> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('application_id, hire_id')

  const existingRows = ensureSupabaseData(data as ExistingThreadContextRow[] | null, error)
  const existingApplicationIds = new Set(
    existingRows
      .map((row) => row.application_id)
      .filter((value): value is string => value != null)
  )
  const existingHireIds = new Set(
    existingRows
      .map((row) => row.hire_id)
      .filter((value): value is string => value != null)
  )

  const { data: applicationData, error: applicationError } = await supabase
    .from('gig_applications')
    .select('id, gig_id, worker_id')
    .not('status', 'in', '(withdrawn,closed)')

  const accessibleApplications = ensureSupabaseData(applicationData as ApplicationBootstrapRow[] | null, applicationError)
  const applicationGigIds = Array.from(new Set(accessibleApplications.map((application) => application.gig_id)))
  const gigPosterMap = await fetchGigPosterMap(applicationGigIds)
  const applicationThreadsToCreate = accessibleApplications
    .filter((application) => !existingApplicationIds.has(application.id))
    .map((application) => {
      const posterId = gigPosterMap.get(application.gig_id)

      if (posterId == null) {
        return null
      }

      return {
        application_id: application.id,
        context_type: 'application',
        poster_id: posterId,
        worker_id: application.worker_id
      }
    })
    .filter((value): value is {
      application_id: string
      context_type: 'application'
      poster_id: string
      worker_id: string
    } => value != null)

  if (applicationThreadsToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from('chat_threads')
      .upsert(applicationThreadsToCreate, {
        onConflict: 'application_id',
        ignoreDuplicates: true
      })

    if (insertError != null) {
      throw new Error(insertError.message)
    }
  }

  const { data: hireData, error: hireError } = await supabase
    .from('hires')
    .select('id, poster_id, worker_id')

  const accessibleHires = ensureSupabaseData(hireData as HireBootstrapRow[] | null, hireError)
  const hireThreadsToCreate = accessibleHires
    .filter((hire) => !existingHireIds.has(hire.id))
    .map((hire) => ({
      context_type: 'hire' as const,
      hire_id: hire.id,
      poster_id: hire.poster_id,
      worker_id: hire.worker_id
    }))

  if (hireThreadsToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from('chat_threads')
      .upsert(hireThreadsToCreate, {
        onConflict: 'hire_id',
        ignoreDuplicates: true
      })

    if (insertError != null) {
      throw new Error(insertError.message)
    }
  }
}

export async function fetchChatInbox(currentUserId: string): Promise<ChatInboxThread[]> {
  await ensureChatThreadsForCurrentUser(currentUserId)

  const { data, error } = await supabase
    .from('chat_threads')
    .select('id, context_type, application_id, hire_id, poster_id, worker_id, created_at, updated_at')
    .order('updated_at', { ascending: false })

  const threadRows = ensureSupabaseData(data as ChatThreadRow[] | null, error)

  if (threadRows.length === 0) {
    return []
  }

  const threadIds = threadRows.map((thread) => thread.id)
  const participantIds = Array.from(new Set(threadRows.map((thread) => getOtherParticipantId(thread, currentUserId))))
  const [profileMap, recentMessageMap, contextTitleMaps] = await Promise.all([
    fetchProfileMap(participantIds),
    fetchRecentMessageMap(threadIds),
    fetchContextTitleMap(threadRows)
  ])

  return threadRows
    .map((thread) => {
      const participantId = getOtherParticipantId(thread, currentUserId)
      const profile = profileMap.get(participantId)
      const lastMessage = recentMessageMap.get(thread.id)
      const contextTitle = thread.context_type === 'application'
        ? thread.application_id == null ? null : contextTitleMaps.applicationTitles.get(thread.application_id) ?? null
        : thread.hire_id == null ? null : contextTitleMaps.hireTitles.get(thread.hire_id) ?? null

      return {
        id: thread.id,
        applicationId: thread.application_id,
        hireId: thread.hire_id,
        contextTitle,
        contextType: thread.context_type,
        createdAt: thread.created_at,
        lastMessageAt: lastMessage?.created_at ?? thread.updated_at,
        lastMessageBody: lastMessage?.body ?? null,
        lastMessageSenderId: lastMessage?.sender_id ?? null,
        participantCity: profile?.city ?? null,
        participantDisplayName: profile?.display_name ?? 'Raket user',
        participantId,
        updatedAt: thread.updated_at
      }
    })
    .sort((left, right) => (
      Date.parse(right.lastMessageAt) - Date.parse(left.lastMessageAt)
    ))
}

export async function fetchThreadMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, thread_id, sender_id, body, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(150)

  const rows = ensureSupabaseData(data as ChatMessageRow[] | null, error)

  return rows.map(mapChatMessage)
}

export async function createChatMessage(input: {
  body: string
  senderId: string
  threadId: string
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      body: input.body,
      sender_id: input.senderId,
      thread_id: input.threadId
    })
    .select('id, thread_id, sender_id, body, created_at')
    .single()

  const row = ensureSupabaseData(data as ChatMessageRow | null, error)

  return mapChatMessage(row)
}
