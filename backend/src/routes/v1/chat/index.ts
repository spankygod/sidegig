import { type FastifyPluginAsync } from 'fastify'
import { findContactDetailViolation, normalizeChatBody } from '../../../modules/chat/policy'
import {
  createThreadMessage,
  ensureApplicationChatThread,
  ensureHireChatThread,
  listThreadMessages,
  listUserChatThreads
} from '../../../modules/chat/repository'
import { ensureUserProfile } from '../../../modules/users/repository'

type ApplicationParams = {
  applicationId: string
}

type HireParams = {
  hireId: string
}

type ThreadParams = {
  threadId: string
}

type ListMessagesQuery = {
  limit?: number
}

type CreateMessageBody = {
  body: string
}

const uuidParam = (name: string) => ({
  type: 'object',
  additionalProperties: false,
  required: [name],
  properties: {
    [name]: { type: 'string', format: 'uuid' }
  }
})

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/threads', {
    onRequest: [fastify.authenticate]
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const threads = await listUserChatThreads(fastify.db, request.authUser!.id)

    return {
      threads
    }
  })

  fastify.post<{ Params: ApplicationParams }>('/applications/:applicationId/thread', {
    onRequest: [fastify.authenticate],
    schema: {
      params: uuidParam('applicationId')
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const thread = await ensureApplicationChatThread(fastify.db, {
      applicationId: request.params.applicationId,
      userId: request.authUser!.id
    })

    if (thread == null) {
      reply.notFound('Application not found or cannot open chat')
      return
    }

    return {
      thread
    }
  })

  fastify.post<{ Params: HireParams }>('/hires/:hireId/thread', {
    onRequest: [fastify.authenticate],
    schema: {
      params: uuidParam('hireId')
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const thread = await ensureHireChatThread(fastify.db, {
      hireId: request.params.hireId,
      userId: request.authUser!.id
    })

    if (thread == null) {
      reply.notFound('Hire not found or cannot open chat')
      return
    }

    return {
      thread
    }
  })

  fastify.get<{ Params: ThreadParams, Querystring: ListMessagesQuery }>('/threads/:threadId/messages', {
    onRequest: [fastify.authenticate],
    schema: {
      params: uuidParam('threadId'),
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const messages = await listThreadMessages(fastify.db, {
      limit: request.query.limit ?? 50,
      threadId: request.params.threadId,
      userId: request.authUser!.id
    })

    if (messages == null) {
      reply.notFound('Chat thread not found')
      return
    }

    return {
      messages
    }
  })

  fastify.post<{ Params: ThreadParams, Body: CreateMessageBody }>('/threads/:threadId/messages', {
    onRequest: [fastify.authenticate],
    schema: {
      params: uuidParam('threadId'),
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['body'],
        properties: {
          body: { type: 'string', minLength: 1, maxLength: 2000 }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const body = normalizeChatBody(request.body.body)

    if (body === '') {
      reply.badRequest('Message body is required')
      return
    }

    const violation = findContactDetailViolation(body)

    if (violation != null) {
      reply.badRequest(`Chat messages cannot include a ${violation}`)
      return
    }

    const message = await createThreadMessage(fastify.db, {
      body,
      senderId: request.authUser!.id,
      threadId: request.params.threadId
    })

    if (message == null) {
      reply.notFound('Chat thread not found')
      return
    }

    reply.code(201)

    return {
      message
    }
  })
}

export default chatRoutes
