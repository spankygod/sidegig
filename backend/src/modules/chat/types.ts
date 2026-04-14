export const CHAT_THREAD_CONTEXTS = [
  'application',
  'hire'
] as const

export type ChatThreadContext = typeof CHAT_THREAD_CONTEXTS[number]

export interface ChatThreadSummary {
  id: string
  contextType: ChatThreadContext
  applicationId: string | null
  hireId: string | null
  posterId: string
  workerId: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessageSummary {
  id: string
  threadId: string
  senderId: string
  body: string
  createdAt: string
}
