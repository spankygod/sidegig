import { type FastifyPluginAsync } from 'fastify'
import {
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../../../modules/notifications/repository'
import { ensureUserProfile } from '../../../modules/users/repository'

type ListNotificationsQuery = {
  unreadOnly?: boolean
  limit?: number
}

type NotificationParams = {
  notificationId: string
}

const notificationParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['notificationId'],
  properties: {
    notificationId: { type: 'string', format: 'uuid' }
  }
}

const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListNotificationsQuery }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          unreadOnly: { type: 'boolean' },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const notifications = await listUserNotifications(fastify.db, {
      userId: request.authUser!.id,
      unreadOnly: request.query.unreadOnly,
      limit: request.query.limit
    })

    return {
      notifications
    }
  })

  fastify.post<{ Params: NotificationParams }>('/:notificationId/read', {
    onRequest: [fastify.authenticate],
    schema: {
      params: notificationParamsSchema
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const notification = await markNotificationRead(fastify.db, {
      notificationId: request.params.notificationId,
      userId: request.authUser!.id
    })

    if (notification == null) {
      reply.notFound('Notification not found')
      return
    }

    return {
      notification
    }
  })

  fastify.post('/read-all', {
    onRequest: [fastify.authenticate]
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const updatedCount = await markAllNotificationsRead(fastify.db, request.authUser!.id)

    return {
      updatedCount
    }
  })
}

export default notificationsRoutes
