import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core'
import { DEFAULT_GIG_APPLICATION_RADIUS_KM, DEFAULT_SERVICE_RADIUS_KM } from '../src/modules/proximity'

const auth = pgSchema('auth')

export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey()
})

export const gigStatusEnum = pgEnum('gig_status', [
  'draft',
  'published',
  'funded',
  'in_progress',
  'completed',
  'disputed',
  'cancelled',
  'closed'
])

export const applicationStatusEnum = pgEnum('application_status', [
  'submitted',
  'rejected',
  'withdrawn',
  'hired',
  'closed'
])

export const hireStatusEnum = pgEnum('hire_status', [
  'pending_funding',
  'funded',
  'accepted',
  'in_progress',
  'worker_marked_done',
  'poster_accepted',
  'disputed',
  'refunded',
  'payout_ready',
  'paid_out'
])

export const chatThreadContextEnum = pgEnum('chat_thread_context', [
  'application',
  'hire'
])

export const disputeStatusEnum = pgEnum('dispute_status', [
  'open',
  'under_review',
  'resolved',
  'cancelled'
])

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  city: text('city'),
  barangay: text('barangay'),
  latitude: numeric('latitude', { precision: 9, scale: 6 }),
  longitude: numeric('longitude', { precision: 9, scale: 6 }),
  serviceRadiusKm: integer('service_radius_km').notNull().default(DEFAULT_SERVICE_RADIUS_KM),
  bio: text('bio'),
  skills: text('skills').array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  serviceRadiusRangeCheck: check(
    'profiles_service_radius_km_check',
    sql`${table.serviceRadiusKm} between 1 and 200`
  ),
  coordinatesPairCheck: check(
    'profiles_coordinates_pair_check',
    sql`(${table.latitude} is null and ${table.longitude} is null) or (${table.latitude} is not null and ${table.longitude} is not null)`
  )
}))

export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  reviewCount: integer('review_count').notNull().default(0),
  jobsCompleted: integer('jobs_completed').notNull().default(0),
  responseRate: integer('response_rate').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const gigPosts = pgTable('gig_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  posterId: uuid('poster_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  priceAmount: integer('price_amount').notNull(),
  currency: text('currency').notNull().default('PHP'),
  durationBucket: text('duration_bucket').notNull(),
  city: text('city').notNull(),
  barangay: text('barangay').notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  applicationRadiusKm: integer('application_radius_km').notNull().default(DEFAULT_GIG_APPLICATION_RADIUS_KM),
  scheduleSummary: text('schedule_summary').notNull(),
  supervisorPresent: boolean('supervisor_present').notNull().default(false),
  ppeProvided: boolean('ppe_provided').notNull().default(false),
  helperOnlyConfirmation: boolean('helper_only_confirmation').notNull().default(false),
  physicalLoad: text('physical_load'),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  status: gigStatusEnum('status').notNull().default('published'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  statusCreatedAtIdx: index('gig_posts_status_created_at_idx').on(table.status, table.createdAt),
  categoryCityIdx: index('gig_posts_category_city_idx').on(table.category, table.city),
  priceAmountCheck: check('gig_posts_price_amount_check', sql`${table.priceAmount} > 0`),
  applicationRadiusRangeCheck: check(
    'gig_posts_application_radius_km_check',
    sql`${table.applicationRadiusKm} between 1 and 200`
  )
}))

export const gigApplications = pgTable('gig_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  gigId: uuid('gig_id').notNull().references(() => gigPosts.id, { onDelete: 'cascade' }),
  workerId: uuid('worker_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  intro: text('intro').notNull(),
  availability: text('availability').notNull(),
  status: applicationStatusEnum('status').notNull().default('submitted'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  gigWorkerUnique: unique('gig_applications_gig_id_worker_id_unique').on(table.gigId, table.workerId),
  workerCreatedAtIdx: index('gig_applications_worker_created_at_idx').on(table.workerId, table.createdAt)
}))

export const hires = pgTable('hires', {
  id: uuid('id').primaryKey().defaultRandom(),
  gigId: uuid('gig_id').notNull().references(() => gigPosts.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').notNull().references(() => gigApplications.id, { onDelete: 'cascade' }),
  posterId: uuid('poster_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  workerId: uuid('worker_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: hireStatusEnum('status').notNull().default('funded'),
  fundedAt: timestamp('funded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  gigUnique: unique('hires_gig_id_unique').on(table.gigId),
  applicationUnique: unique('hires_application_id_unique').on(table.applicationId),
  posterStatusIdx: index('hires_poster_status_idx').on(table.posterId, table.status),
  workerStatusIdx: index('hires_worker_status_idx').on(table.workerId, table.status)
}))

export const chatThreads = pgTable('chat_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  contextType: chatThreadContextEnum('context_type').notNull(),
  applicationId: uuid('application_id').references(() => gigApplications.id, { onDelete: 'cascade' }),
  hireId: uuid('hire_id').references(() => hires.id, { onDelete: 'cascade' }),
  posterId: uuid('poster_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  workerId: uuid('worker_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  applicationUnique: unique('chat_threads_application_id_unique').on(table.applicationId),
  hireUnique: unique('chat_threads_hire_id_unique').on(table.hireId),
  posterUpdatedAtIdx: index('chat_threads_poster_updated_at_idx').on(table.posterId, table.updatedAt),
  workerUpdatedAtIdx: index('chat_threads_worker_updated_at_idx').on(table.workerId, table.updatedAt),
  contextCheck: check(
    'chat_threads_context_check',
    sql`(${table.contextType} = 'application' and ${table.applicationId} is not null and ${table.hireId} is null) or (${table.contextType} = 'hire' and ${table.hireId} is not null and ${table.applicationId} is null)`
  )
}))

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  threadCreatedAtIdx: index('chat_messages_thread_created_at_idx').on(table.threadId, table.createdAt),
  senderCreatedAtIdx: index('chat_messages_sender_created_at_idx').on(table.senderId, table.createdAt)
}))

export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  hireId: uuid('hire_id').notNull().references(() => hires.id, { onDelete: 'cascade' }),
  openedBy: uuid('opened_by').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  posterId: uuid('poster_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  workerId: uuid('worker_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  details: text('details'),
  status: disputeStatusEnum('status').notNull().default('open'),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  hireUnique: unique('disputes_hire_id_unique').on(table.hireId),
  posterStatusIdx: index('disputes_poster_status_idx').on(table.posterId, table.status),
  workerStatusIdx: index('disputes_worker_status_idx').on(table.workerId, table.status),
  openedByIdx: index('disputes_opened_by_idx').on(table.openedBy)
}))

export const authUsersRelations = relations(authUsers, ({ many, one }) => ({
  profile: one(profiles, {
    fields: [authUsers.id],
    references: [profiles.id]
  }),
  gigPosts: many(gigPosts),
  gigApplications: many(gigApplications),
  posterHires: many(hires),
  workerHires: many(hires),
  openedDisputes: many(disputes)
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  authUser: one(authUsers, {
    fields: [profiles.id],
    references: [authUsers.id]
  }),
  stats: one(userStats, {
    fields: [profiles.id],
    references: [userStats.userId]
  })
}))

export const userStatsRelations = relations(userStats, ({ one }) => ({
  profile: one(profiles, {
    fields: [userStats.userId],
    references: [profiles.id]
  })
}))

export const gigPostsRelations = relations(gigPosts, ({ one, many }) => ({
  poster: one(authUsers, {
    fields: [gigPosts.posterId],
    references: [authUsers.id]
  }),
  applications: many(gigApplications),
  hire: one(hires, {
    fields: [gigPosts.id],
    references: [hires.gigId]
  })
}))

export const gigApplicationsRelations = relations(gigApplications, ({ one }) => ({
  gig: one(gigPosts, {
    fields: [gigApplications.gigId],
    references: [gigPosts.id]
  }),
  worker: one(authUsers, {
    fields: [gigApplications.workerId],
    references: [authUsers.id]
  }),
  hire: one(hires, {
    fields: [gigApplications.id],
    references: [hires.applicationId]
  })
}))

export const hiresRelations = relations(hires, ({ one }) => ({
  gig: one(gigPosts, {
    fields: [hires.gigId],
    references: [gigPosts.id]
  }),
  application: one(gigApplications, {
    fields: [hires.applicationId],
    references: [gigApplications.id]
  }),
  poster: one(authUsers, {
    fields: [hires.posterId],
    references: [authUsers.id]
  }),
  worker: one(authUsers, {
    fields: [hires.workerId],
    references: [authUsers.id]
  }),
  dispute: one(disputes, {
    fields: [hires.id],
    references: [disputes.hireId]
  })
}))

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  application: one(gigApplications, {
    fields: [chatThreads.applicationId],
    references: [gigApplications.id]
  }),
  hire: one(hires, {
    fields: [chatThreads.hireId],
    references: [hires.id]
  }),
  poster: one(authUsers, {
    fields: [chatThreads.posterId],
    references: [authUsers.id]
  }),
  worker: one(authUsers, {
    fields: [chatThreads.workerId],
    references: [authUsers.id]
  }),
  messages: many(chatMessages)
}))

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id]
  }),
  sender: one(authUsers, {
    fields: [chatMessages.senderId],
    references: [authUsers.id]
  })
}))

export const disputesRelations = relations(disputes, ({ one }) => ({
  hire: one(hires, {
    fields: [disputes.hireId],
    references: [hires.id]
  }),
  openedByUser: one(authUsers, {
    fields: [disputes.openedBy],
    references: [authUsers.id]
  }),
  poster: one(authUsers, {
    fields: [disputes.posterId],
    references: [authUsers.id]
  }),
  worker: one(authUsers, {
    fields: [disputes.workerId],
    references: [authUsers.id]
  })
}))

export const schema = {
  authUsers,
  profiles,
  userStats,
  gigPosts,
  gigApplications,
  hires,
  chatThreads,
  chatMessages,
  disputes
}

export type DrizzleSchema = typeof schema
