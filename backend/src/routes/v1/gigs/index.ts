import { type FastifyPluginAsync } from 'fastify'
import {
  closeOpenApplicationsForGig,
  listGigApplicationsForPoster,
  reviewGigApplication
} from '../../../modules/applications/repository'
import { REVIEWABLE_APPLICATION_STATUSES, type ReviewableApplicationStatus } from '../../../modules/applications/types'
import {
  createGig,
  getPosterGigById,
  getPublicGigById,
  listPosterGigs,
  listPublicGigs,
  updatePosterGig
} from '../../../modules/gigs/repository'
import { fundGigHire } from '../../../modules/hires/repository'
import {
  DURATION_BUCKETS,
  GIG_CATEGORIES,
  GIG_STATUSES,
  MANAGEABLE_GIG_STATUSES,
  type CreateGigInput,
  type GigCategory,
  type GigStatus,
  type OwnedGig,
  type UpdateGigInput
} from '../../../modules/gigs/types'
import { ensureUserProfile, getWorkerServiceArea } from '../../../modules/users/repository'

type ListGigsQuery = {
  category?: GigCategory
  city?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  limit?: number
}

type PublicGigParams = {
  gigId: string
}

type PublicGigDetailQuery = Pick<ListGigsQuery, 'latitude' | 'longitude'>

type ListPosterGigsQuery = {
  status?: GigStatus
  limit?: number
}

type CreateGigBody = CreateGigInput
type UpdateGigBody = UpdateGigInput

type ReviewApplicationBody = {
  status: ReviewableApplicationStatus
}

type FundHireBody = {
  applicationId: string
}

function hasOwnProperty (value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function normalizeNullableString (value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function validateConstructionRequirements (input: {
  category: GigCategory
  supervisorPresent: boolean
  ppeProvided: boolean
  helperOnlyConfirmation: boolean
  physicalLoad: string | null
  startsAt: string | null
  endsAt: string | null
}): string | null {
  if (input.category !== 'construction_helper') {
    return null
  }

  if (
    !input.supervisorPresent ||
    !input.ppeProvided ||
    input.helperOnlyConfirmation !== true ||
    input.physicalLoad == null ||
    input.startsAt == null ||
    input.endsAt == null
  ) {
    return 'Construction helper gigs require supervisor, PPE, helper-only confirmation, physical load, and start/end time'
  }

  if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
    return 'Construction helper gigs must end after the start time'
  }

  return null
}

function buildUpdateValidationState (existingGig: OwnedGig, body: UpdateGigBody) {
  return {
    category: body.category ?? existingGig.category,
    supervisorPresent: hasOwnProperty(body, 'supervisorPresent')
      ? body.supervisorPresent ?? false
      : existingGig.construction?.supervisorPresent ?? false,
    ppeProvided: hasOwnProperty(body, 'ppeProvided')
      ? body.ppeProvided ?? false
      : existingGig.construction?.ppeProvided ?? false,
    helperOnlyConfirmation: hasOwnProperty(body, 'helperOnlyConfirmation')
      ? body.helperOnlyConfirmation ?? false
      : existingGig.construction?.helperOnlyConfirmation ?? false,
    physicalLoad: hasOwnProperty(body, 'physicalLoad')
      ? normalizeNullableString(body.physicalLoad) ?? null
      : existingGig.construction?.physicalLoad ?? null,
    startsAt: hasOwnProperty(body, 'startsAt')
      ? body.startsAt ?? null
      : existingGig.startsAt,
    endsAt: hasOwnProperty(body, 'endsAt')
      ? body.endsAt ?? null
      : existingGig.endsAt
  }
}

function buildUpdateInput (body: UpdateGigBody): UpdateGigInput {
  return {
    title: body.title?.trim(),
    category: body.category,
    description: body.description?.trim(),
    priceAmount: body.priceAmount,
    durationBucket: body.durationBucket,
    city: body.city?.trim(),
    barangay: body.barangay?.trim(),
    latitude: hasOwnProperty(body, 'latitude') ? body.latitude : undefined,
    longitude: hasOwnProperty(body, 'longitude') ? body.longitude : undefined,
    applicationRadiusKm: body.applicationRadiusKm,
    scheduleSummary: body.scheduleSummary?.trim(),
    supervisorPresent: body.supervisorPresent,
    ppeProvided: body.ppeProvided,
    helperOnlyConfirmation: body.helperOnlyConfirmation,
    physicalLoad: hasOwnProperty(body, 'physicalLoad')
      ? normalizeNullableString(body.physicalLoad)
      : undefined,
    startsAt: hasOwnProperty(body, 'startsAt') ? body.startsAt ?? null : undefined,
    endsAt: hasOwnProperty(body, 'endsAt') ? body.endsAt ?? null : undefined,
    status: body.status
  }
}

function hasContentEdits (body: UpdateGigBody): boolean {
  const contentKeys = [
    'title',
    'category',
    'description',
    'priceAmount',
    'durationBucket',
    'city',
    'barangay',
    'latitude',
    'longitude',
    'applicationRadiusKm',
    'scheduleSummary',
    'supervisorPresent',
    'ppeProvided',
    'helperOnlyConfirmation',
    'physicalLoad',
    'startsAt',
    'endsAt'
  ]

  return contentKeys.some((key) => hasOwnProperty(body, key))
}

const gigsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ListGigsQuery }>('/', {
    onRequest: [fastify.tryAuthenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          category: { type: 'string', enum: [...GIG_CATEGORIES] },
          city: { type: 'string', minLength: 1, maxLength: 80 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          radiusKm: { type: 'integer', minimum: 1, maximum: 200 },
          limit: { type: 'integer', minimum: 1, maximum: 50 }
        }
      }
    }
  }, async function (request) {
    const hasLatitude = request.query.latitude != null
    const hasLongitude = request.query.longitude != null

    if (hasLatitude !== hasLongitude) {
      throw fastify.httpErrors.badRequest('Latitude and longitude must be provided together')
    }

    if (request.query.radiusKm != null && !hasLatitude) {
      throw fastify.httpErrors.badRequest('radiusKm requires latitude and longitude')
    }

    const workerServiceArea = request.authUser == null
      ? null
      : await getWorkerServiceArea(fastify.db, request.authUser.id)

    const proximitySource = workerServiceArea ?? {
      latitude: request.query.latitude,
      longitude: request.query.longitude,
      serviceRadiusKm: request.query.radiusKm
    }

    const gigs = await listPublicGigs(fastify.db, {
      category: request.query.category,
      city: request.query.city?.trim(),
      latitude: proximitySource.latitude ?? undefined,
      longitude: proximitySource.longitude ?? undefined,
      radiusKm: proximitySource.serviceRadiusKm ?? undefined,
      limit: request.query.limit ?? 20
    })

    return {
      gigs
    }
  })

  fastify.get<{ Params: PublicGigParams, Querystring: PublicGigDetailQuery }>('/:gigId', {
    onRequest: [fastify.tryAuthenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' }
        }
      },
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 }
        }
      }
    }
  }, async function (request, reply) {
    const hasLatitude = request.query.latitude != null
    const hasLongitude = request.query.longitude != null

    if (hasLatitude !== hasLongitude) {
      throw fastify.httpErrors.badRequest('Latitude and longitude must be provided together')
    }

    const workerServiceArea = request.authUser == null
      ? null
      : await getWorkerServiceArea(fastify.db, request.authUser.id)

    const gig = await getPublicGigById(fastify.db, request.params.gigId, {
      latitude: workerServiceArea?.latitude ?? request.query.latitude,
      longitude: workerServiceArea?.longitude ?? request.query.longitude
    })

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    return {
      gig
    }
  })

  fastify.get<{ Querystring: ListPosterGigsQuery }>('/mine', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: [...GIG_STATUSES] },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    }
  }, async function (request) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gigs = await listPosterGigs(fastify.db, request.authUser!.id, {
      status: request.query.status,
      limit: request.query.limit ?? 50
    })

    return {
      gigs
    }
  })

  fastify.get<{ Params: { gigId: string } }>('/mine/:gigId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    return {
      gig
    }
  })

  fastify.get<{ Params: { gigId: string } }>('/mine/:gigId/applications', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    const applications = await listGigApplicationsForPoster(fastify.db, request.authUser!.id, request.params.gigId)

    return {
      gig,
      applications
    }
  })

  fastify.post<{ Body: CreateGigBody }>('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'category',
          'description',
          'priceAmount',
          'durationBucket',
          'city',
          'barangay',
          'latitude',
          'longitude',
          'scheduleSummary'
        ],
        properties: {
          title: { type: 'string', minLength: 4, maxLength: 120 },
          category: { type: 'string', enum: [...GIG_CATEGORIES] },
          description: { type: 'string', minLength: 20, maxLength: 3000 },
          priceAmount: { type: 'integer', minimum: 100 },
          durationBucket: { type: 'string', enum: [...DURATION_BUCKETS] },
          city: { type: 'string', minLength: 1, maxLength: 80 },
          barangay: { type: 'string', minLength: 1, maxLength: 80 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          applicationRadiusKm: { type: 'integer', minimum: 1, maximum: 200 },
          scheduleSummary: { type: 'string', minLength: 4, maxLength: 280 },
          supervisorPresent: { type: 'boolean' },
          ppeProvided: { type: 'boolean' },
          helperOnlyConfirmation: { type: 'boolean' },
          physicalLoad: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
          startsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
          endsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
          status: { type: 'string', enum: ['draft', 'published'] }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const physicalLoad = normalizeNullableString(request.body.physicalLoad) ?? null
    const constructionError = validateConstructionRequirements({
      category: request.body.category,
      supervisorPresent: request.body.supervisorPresent ?? false,
      ppeProvided: request.body.ppeProvided ?? false,
      helperOnlyConfirmation: request.body.helperOnlyConfirmation ?? false,
      physicalLoad,
      startsAt: request.body.startsAt ?? null,
      endsAt: request.body.endsAt ?? null
    })

    if (constructionError != null) {
      reply.badRequest(constructionError)
      return
    }

    const gig = await createGig(fastify.db, request.authUser!.id, {
      ...request.body,
      title: request.body.title.trim(),
      description: request.body.description.trim(),
      city: request.body.city.trim(),
      barangay: request.body.barangay.trim(),
      scheduleSummary: request.body.scheduleSummary.trim(),
      applicationRadiusKm: request.body.applicationRadiusKm,
      physicalLoad,
      status: request.body.status
    })

    reply.code(201)

    return {
      gig
    }
  })

  fastify.patch<{ Params: { gigId: string }, Body: UpdateGigBody }>('/mine/:gigId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string', minLength: 4, maxLength: 120 },
          category: { type: 'string', enum: [...GIG_CATEGORIES] },
          description: { type: 'string', minLength: 20, maxLength: 3000 },
          priceAmount: { type: 'integer', minimum: 100 },
          durationBucket: { type: 'string', enum: [...DURATION_BUCKETS] },
          city: { type: 'string', minLength: 1, maxLength: 80 },
          barangay: { type: 'string', minLength: 1, maxLength: 80 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          applicationRadiusKm: { type: 'integer', minimum: 1, maximum: 200 },
          scheduleSummary: { type: 'string', minLength: 4, maxLength: 280 },
          supervisorPresent: { type: 'boolean' },
          ppeProvided: { type: 'boolean' },
          helperOnlyConfirmation: { type: 'boolean' },
          physicalLoad: { anyOf: [{ type: 'string', minLength: 1, maxLength: 80 }, { type: 'null' }] },
          startsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
          endsAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
          status: { type: 'string', enum: [...MANAGEABLE_GIG_STATUSES] }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const hasLatitude = hasOwnProperty(request.body, 'latitude')
    const hasLongitude = hasOwnProperty(request.body, 'longitude')

    if (hasLatitude !== hasLongitude) {
      reply.badRequest('Latitude and longitude must be updated together')
      return
    }

    const existingGig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

    if (existingGig == null) {
      reply.notFound('Gig not found')
      return
    }

    const requestedStatus = request.body.status
    const contentEdits = hasContentEdits(request.body)

    if (contentEdits && !['draft', 'published'].includes(existingGig.status)) {
      reply.conflict('Only draft or published gigs can be edited')
      return
    }

    if (['funded', 'in_progress', 'completed', 'disputed'].includes(existingGig.status)) {
      reply.conflict('This gig can no longer be updated manually')
      return
    }

    if (['closed', 'cancelled'].includes(existingGig.status) && requestedStatus != null && requestedStatus !== existingGig.status) {
      reply.conflict('Closed or cancelled gigs cannot be reopened')
      return
    }

    if (requestedStatus === 'draft' && existingGig.applicationCount > 0) {
      reply.conflict('Gigs with applications cannot move back to draft')
      return
    }

    const constructionError = validateConstructionRequirements(buildUpdateValidationState(existingGig, request.body))

    if (constructionError != null) {
      reply.badRequest(constructionError)
      return
    }

    const updatedGig = await updatePosterGig(
      fastify.db,
      request.authUser!.id,
      request.params.gigId,
      buildUpdateInput(request.body)
    )

    if (updatedGig == null) {
      reply.notFound('Gig not found')
      return
    }

    const shouldCloseApplications = requestedStatus != null && ['closed', 'cancelled'].includes(requestedStatus)

    if (shouldCloseApplications) {
      await closeOpenApplicationsForGig(fastify.db, request.authUser!.id, request.params.gigId)

      const refreshedGig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

      return {
        gig: refreshedGig ?? updatedGig
      }
    }

    return {
      gig: updatedGig
    }
  })

  fastify.patch<{ Params: { gigId: string, applicationId: string }, Body: ReviewApplicationBody }>('/mine/:gigId/applications/:applicationId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId', 'applicationId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' },
          applicationId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['status'],
        properties: {
          status: { type: 'string', enum: [...REVIEWABLE_APPLICATION_STATUSES] }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    if (gig.status !== 'published') {
      reply.conflict('Only active gigs can review applicants')
      return
    }

    const application = await reviewGigApplication(fastify.db, {
      posterId: request.authUser!.id,
      gigId: request.params.gigId,
      applicationId: request.params.applicationId,
      status: request.body.status
    })

    if (application == null) {
      reply.notFound('Application not found or can no longer be reviewed')
      return
    }

    return {
      application
    }
  })

  fastify.post<{ Params: { gigId: string }, Body: FundHireBody }>('/mine/:gigId/fund', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['gigId'],
        properties: {
          gigId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['applicationId'],
        properties: {
          applicationId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async function (request, reply) {
    await ensureUserProfile(fastify.db, request.authUser!)

    const gig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)

    if (gig == null) {
      reply.notFound('Gig not found')
      return
    }

    if (gig.status !== 'published') {
      reply.conflict('Only published gigs can fund a hire')
      return
    }

    const hire = await fundGigHire(fastify.db, {
      posterId: request.authUser!.id,
      gigId: request.params.gigId,
      applicationId: request.body.applicationId
    })

    if (hire == null) {
      reply.notFound('Application not found or can no longer be hired')
      return
    }

    const updatedGig = await getPosterGigById(fastify.db, request.authUser!.id, request.params.gigId)
    const applications = await listGigApplicationsForPoster(fastify.db, request.authUser!.id, request.params.gigId)

    return {
      hire,
      gig: updatedGig,
      applications
    }
  })
}

export default gigsRoutes
