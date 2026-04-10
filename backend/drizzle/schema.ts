import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core'

const auth = pgSchema('auth')
const publicSchema = pgSchema('public')

export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey()
})

export const gigStatusEnum = publicSchema.enum('gig_status', [
  'draft',
  'published',
  'shortlisting',
  'funded',
  'in_progress',
  'completed',
  'disputed',
  'cancelled',
  'closed'
])

export const applicationStatusEnum = publicSchema.enum('application_status', [
  'submitted',
  'shortlisted',
  'rejected',
  'withdrawn',
  'hired',
  'closed'
])

export const profiles = publicSchema.table('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  city: text('city'),
  barangay: text('barangay'),
  bio: text('bio'),
  skills: text('skills').array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const userStats = publicSchema.table('user_stats', {
  userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  reviewCount: integer('review_count').notNull().default(0),
  jobsCompleted: integer('jobs_completed').notNull().default(0),
  responseRate: integer('response_rate').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const gigPosts = publicSchema.table('gig_posts', {
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
  categoryCityIdx: index('gig_posts_category_city_idx').on(table.category, table.city)
}))

export const gigApplications = publicSchema.table('gig_applications', {
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

export const authUsersRelations = relations(authUsers, ({ many, one }) => ({
  profile: one(profiles, {
    fields: [authUsers.id],
    references: [profiles.id]
  }),
  gigPosts: many(gigPosts),
  gigApplications: many(gigApplications)
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
  applications: many(gigApplications)
}))

export const gigApplicationsRelations = relations(gigApplications, ({ one }) => ({
  gig: one(gigPosts, {
    fields: [gigApplications.gigId],
    references: [gigPosts.id]
  }),
  worker: one(authUsers, {
    fields: [gigApplications.workerId],
    references: [authUsers.id]
  })
}))

export const schema = {
  authUsers,
  profiles,
  userStats,
  gigPosts,
  gigApplications
}

export type DrizzleSchema = typeof schema
