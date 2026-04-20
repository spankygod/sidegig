#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DEFAULT_DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/raket'
const TEST_PASSWORD_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8r7kwh28ykV59wH0z7dxyzKDn5X7xW'
const now = new Date()

const users = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'seed.user01@raket.local',
    displayName: 'Maria Santos',
    city: 'Quezon City',
    barangay: 'Batasan Hills',
    latitude: 14.6769,
    longitude: 121.0952,
    serviceRadiusKm: 18,
    bio: 'Dependable helper for errands, packing, and on-site coordination.',
    skills: ['errands', 'packing', 'customer service'],
    rating: '4.90',
    reviewCount: 18,
    jobsCompleted: 21,
    responseRate: 97
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'seed.user02@raket.local',
    displayName: 'Jose Reyes',
    city: 'Makati',
    barangay: 'Poblacion',
    latitude: 14.5653,
    longitude: 121.0293,
    serviceRadiusKm: 16,
    bio: 'Handyman and moving assistant with weekend availability.',
    skills: ['moving', 'basic repair', 'driving'],
    rating: '4.80',
    reviewCount: 14,
    jobsCompleted: 17,
    responseRate: 95
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'seed.user03@raket.local',
    displayName: 'Anna Cruz',
    city: 'Pasig',
    barangay: 'Kapitolyo',
    latitude: 14.5672,
    longitude: 121.0638,
    serviceRadiusKm: 15,
    bio: 'Organized assistant for tutoring schedules, admin tasks, and follow-ups.',
    skills: ['tutoring', 'admin support', 'scheduling'],
    rating: '4.95',
    reviewCount: 26,
    jobsCompleted: 32,
    responseRate: 99
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'seed.user04@raket.local',
    displayName: 'Carlo Mendoza',
    city: 'Taguig',
    barangay: 'Fort Bonifacio',
    latitude: 14.5495,
    longitude: 121.0464,
    serviceRadiusKm: 20,
    bio: 'Event crew lead with setup, teardown, and runner experience.',
    skills: ['event staffing', 'logistics', 'crew lead'],
    rating: '4.70',
    reviewCount: 11,
    jobsCompleted: 13,
    responseRate: 92
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    email: 'seed.user05@raket.local',
    displayName: 'Bea Flores',
    city: 'Manila',
    barangay: 'Sampaloc',
    latitude: 14.6042,
    longitude: 120.9896,
    serviceRadiusKm: 14,
    bio: 'Creative support for social media shoots and product staging.',
    skills: ['photo assist', 'styling', 'content support'],
    rating: '4.88',
    reviewCount: 19,
    jobsCompleted: 24,
    responseRate: 96
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    email: 'seed.user06@raket.local',
    displayName: 'Liam Navarro',
    city: 'Cebu City',
    barangay: 'Lahug',
    latitude: 10.3321,
    longitude: 123.9066,
    serviceRadiusKm: 22,
    bio: 'Reliable field helper for labor-intensive tasks around Cebu.',
    skills: ['construction helper', 'lifting', 'warehouse support'],
    rating: '4.76',
    reviewCount: 15,
    jobsCompleted: 20,
    responseRate: 93
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    email: 'seed.user07@raket.local',
    displayName: 'Nina Garcia',
    city: 'Quezon City',
    barangay: 'Commonwealth',
    latitude: 14.7051,
    longitude: 121.0828,
    serviceRadiusKm: 17,
    bio: 'Friendly neighborhood helper for household tasks and school pickups.',
    skills: ['cleaning', 'errands', 'child-safe support'],
    rating: '4.91',
    reviewCount: 22,
    jobsCompleted: 27,
    responseRate: 98
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    email: 'seed.user08@raket.local',
    displayName: 'Paolo Dimaano',
    city: 'Mandaluyong',
    barangay: 'Highway Hills',
    latitude: 14.5792,
    longitude: 121.0357,
    serviceRadiusKm: 15,
    bio: 'Fast learner for delivery runs, event errands, and simple installs.',
    skills: ['delivery', 'runner', 'setup support'],
    rating: '4.69',
    reviewCount: 9,
    jobsCompleted: 12,
    responseRate: 90
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    email: 'seed.user09@raket.local',
    displayName: 'Steph Tan',
    city: 'Pasay',
    barangay: 'San Isidro',
    latitude: 14.5374,
    longitude: 121.0018,
    serviceRadiusKm: 13,
    bio: 'Graphic and admin support for fast-turnaround digital work.',
    skills: ['graphic design', 'Canva', 'data entry'],
    rating: '4.84',
    reviewCount: 12,
    jobsCompleted: 16,
    responseRate: 94
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    email: 'seed.user10@raket.local',
    displayName: 'Kaye Lopez',
    city: 'Davao City',
    barangay: 'Poblacion District',
    latitude: 7.0707,
    longitude: 125.6087,
    serviceRadiusKm: 19,
    bio: 'Flexible remote and on-site support for admin, design, and errands.',
    skills: ['virtual assistance', 'graphic design', 'research'],
    rating: '4.93',
    reviewCount: 20,
    jobsCompleted: 25,
    responseRate: 99
  }
]

const gigs = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    posterId: users[0].id,
    title: 'Studio apartment deep clean before turnover',
    category: 'cleaning_home_help',
    description: 'Need one helper for a four-hour deep clean of a studio unit before the new tenant arrives.',
    priceAmount: 1800,
    durationBucket: 'same_day',
    city: 'Quezon City',
    barangay: 'Batasan Hills',
    latitude: 14.6782,
    longitude: 121.0942,
    applicationRadiusKm: 10,
    scheduleSummary: 'Apr 23, 9:00 AM to 1:00 PM',
    supervisorPresent: false,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-23T01:00:00.000Z',
    endsAt: '2026-04-23T05:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    posterId: users[1].id,
    title: 'Help move office chairs and small cabinets',
    category: 'moving_help',
    description: 'Looking for two careful helpers to move furniture between two nearby office units.',
    priceAmount: 2500,
    durationBucket: 'same_day',
    city: 'Makati',
    barangay: 'Poblacion',
    latitude: 14.5661,
    longitude: 121.0312,
    applicationRadiusKm: 12,
    scheduleSummary: 'Apr 24, 1:00 PM to 6:00 PM',
    supervisorPresent: true,
    ppeProvided: true,
    helperOnlyConfirmation: false,
    physicalLoad: 'Moderate lifting of chairs, boxes, and two small cabinets.',
    startsAt: '2026-04-24T05:00:00.000Z',
    endsAt: '2026-04-24T10:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    posterId: users[2].id,
    title: 'Construction helper for weekend tile hauling',
    category: 'construction_helper',
    description: 'Need a physically fit helper to carry tile boxes and keep the work area organized.',
    priceAmount: 3200,
    durationBucket: 'two_to_seven_days',
    city: 'Pasig',
    barangay: 'Kapitolyo',
    latitude: 14.5668,
    longitude: 121.0619,
    applicationRadiusKm: 14,
    scheduleSummary: 'Apr 25 to Apr 26, 8:00 AM to 5:00 PM',
    supervisorPresent: true,
    ppeProvided: true,
    helperOnlyConfirmation: true,
    physicalLoad: 'Heavy lifting throughout the shift.',
    startsAt: '2026-04-25T00:00:00.000Z',
    endsAt: '2026-04-26T09:00:00.000Z',
    status: 'funded'
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    posterId: users[3].id,
    title: 'Event registration desk assistant',
    category: 'event_staffing',
    description: 'Assist with attendee check-in, queue management, and quick issue coordination during a brand event.',
    priceAmount: 2800,
    durationBucket: 'same_day',
    city: 'Taguig',
    barangay: 'Fort Bonifacio',
    latitude: 14.5502,
    longitude: 121.0472,
    applicationRadiusKm: 12,
    scheduleSummary: 'Apr 26, 11:00 AM to 8:00 PM',
    supervisorPresent: true,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-26T03:00:00.000Z',
    endsAt: '2026-04-26T12:00:00.000Z',
    status: 'in_progress'
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    posterId: users[4].id,
    title: 'Product shoot assistant for skincare brand',
    category: 'photo_video_support',
    description: 'Need help arranging props, reflectors, and product swaps during a half-day shoot.',
    priceAmount: 3000,
    durationBucket: 'same_day',
    city: 'Manila',
    barangay: 'Sampaloc',
    latitude: 14.6061,
    longitude: 120.9882,
    applicationRadiusKm: 11,
    scheduleSummary: 'Apr 22, 1:00 PM to 6:00 PM',
    supervisorPresent: true,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-22T05:00:00.000Z',
    endsAt: '2026-04-22T10:00:00.000Z',
    status: 'completed'
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    posterId: users[5].id,
    title: 'Remote spreadsheet cleanup and inventory tagging',
    category: 'virtual_assistance_admin',
    description: 'Looking for a detail-oriented assistant to normalize item names and tag supplier records.',
    priceAmount: 2200,
    durationBucket: 'two_to_seven_days',
    city: 'Cebu City',
    barangay: 'Lahug',
    latitude: 10.3312,
    longitude: 123.9054,
    applicationRadiusKm: 25,
    scheduleSummary: 'Flexible over 3 days, around 4 hours total',
    supervisorPresent: false,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-23T01:00:00.000Z',
    endsAt: '2026-04-26T09:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    posterId: users[6].id,
    title: 'Grade school math review tutor',
    category: 'tutoring_academic_support',
    description: 'Need a patient tutor for two sessions covering fractions, word problems, and study habits.',
    priceAmount: 2400,
    durationBucket: 'two_to_seven_days',
    city: 'Quezon City',
    barangay: 'Commonwealth',
    latitude: 14.7043,
    longitude: 121.0805,
    applicationRadiusKm: 9,
    scheduleSummary: 'Two sessions this weekend, 2 hours each',
    supervisorPresent: false,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-25T02:00:00.000Z',
    endsAt: '2026-04-26T08:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    posterId: users[7].id,
    title: 'Same-day grocery and pharmacy run',
    category: 'errands_personal_assistance',
    description: 'Need help buying groceries and medicine for an elderly parent, then dropping them at home.',
    priceAmount: 1500,
    durationBucket: 'same_day',
    city: 'Mandaluyong',
    barangay: 'Highway Hills',
    latitude: 14.5785,
    longitude: 121.0371,
    applicationRadiusKm: 8,
    scheduleSummary: 'Apr 22, 4:00 PM to 7:00 PM',
    supervisorPresent: false,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-22T08:00:00.000Z',
    endsAt: '2026-04-22T11:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    posterId: users[8].id,
    title: 'Quick Canva social post redesign',
    category: 'graphic_design_creative',
    description: 'Need 10 square promo cards updated with new pricing, CTA, and cleaner hierarchy.',
    priceAmount: 2600,
    durationBucket: 'two_to_seven_days',
    city: 'Pasay',
    barangay: 'San Isidro',
    latitude: 14.5384,
    longitude: 121.0031,
    applicationRadiusKm: 20,
    scheduleSummary: 'Delivery needed within 3 days',
    supervisorPresent: false,
    ppeProvided: false,
    helperOnlyConfirmation: false,
    physicalLoad: null,
    startsAt: '2026-04-22T01:00:00.000Z',
    endsAt: '2026-04-25T10:00:00.000Z',
    status: 'published'
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    posterId: users[9].id,
    title: 'Warehouse helper for repacking supplies',
    category: 'construction_helper',
    description: 'Need one helper to repack tools, sort boxes, and assist with loading for a site handoff.',
    priceAmount: 2900,
    durationBucket: 'same_day',
    city: 'Davao City',
    barangay: 'Poblacion District',
    latitude: 7.0739,
    longitude: 125.6115,
    applicationRadiusKm: 15,
    scheduleSummary: 'Apr 24, 8:00 AM to 4:00 PM',
    supervisorPresent: true,
    ppeProvided: true,
    helperOnlyConfirmation: true,
    physicalLoad: 'Moderate to heavy lifting with gloves provided.',
    startsAt: '2026-04-24T00:00:00.000Z',
    endsAt: '2026-04-24T08:00:00.000Z',
    status: 'published'
  }
]

const applications = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    gigId: gigs[0].id,
    workerId: users[6].id,
    intro: 'I do regular deep cleaning jobs in QC and can bring my own checklist.',
    availability: 'Available on Apr 23 morning.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    gigId: gigs[0].id,
    workerId: users[7].id,
    intro: 'I can help with turnovers and appliance wiping if needed.',
    availability: 'Free from 8 AM to 2 PM.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    gigId: gigs[1].id,
    workerId: users[3].id,
    intro: 'Used to moving office furniture and handling basic disassembly.',
    availability: 'Can commit to the full shift.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    gigId: gigs[1].id,
    workerId: users[8].id,
    intro: 'I have handled condo and office moving support in Makati and Pasay.',
    availability: 'Available after lunch onward.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    gigId: gigs[2].id,
    workerId: users[1].id,
    intro: 'Comfortable with heavy lifting and keeping tools organized on site.',
    availability: 'Open both weekend days.',
    status: 'hired'
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    gigId: gigs[2].id,
    workerId: users[7].id,
    intro: 'Can help with hauling and staging materials if the site is accessible.',
    availability: 'Available Saturday only.',
    status: 'closed'
  },
  {
    id: '20000000-0000-4000-8000-000000000007',
    gigId: gigs[3].id,
    workerId: users[4].id,
    intro: 'I have event registration and ushering experience for mall activations.',
    availability: 'Can stay until event close.',
    status: 'hired'
  },
  {
    id: '20000000-0000-4000-8000-000000000008',
    gigId: gigs[3].id,
    workerId: users[8].id,
    intro: 'Comfortable handling guest concerns and line management.',
    availability: 'Available the whole day.',
    status: 'closed'
  },
  {
    id: '20000000-0000-4000-8000-000000000009',
    gigId: gigs[4].id,
    workerId: users[9].id,
    intro: 'I can support product swaps, styling, and reflector handling.',
    availability: 'Available on the scheduled shoot date.',
    status: 'hired'
  },
  {
    id: '20000000-0000-4000-8000-000000000010',
    gigId: gigs[4].id,
    workerId: users[2].id,
    intro: 'Happy to help with shot lists and sample logging during the shoot.',
    availability: 'Can join the full half-day.',
    status: 'closed'
  },
  {
    id: '20000000-0000-4000-8000-000000000011',
    gigId: gigs[5].id,
    workerId: users[9].id,
    intro: 'I handle cleanup and tagging in Sheets and can finish this quickly.',
    availability: 'Available for the next three evenings.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000012',
    gigId: gigs[6].id,
    workerId: users[2].id,
    intro: 'I tutor elementary math and can prepare quick review worksheets.',
    availability: 'Free on both weekend sessions.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000013',
    gigId: gigs[7].id,
    workerId: users[0].id,
    intro: 'I can complete the errand run and provide photo updates.',
    availability: 'Available late afternoon today.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000014',
    gigId: gigs[8].id,
    workerId: users[9].id,
    intro: 'Can update the design system, revise copy layout, and export all assets.',
    availability: 'Can deliver first drafts within 24 hours.',
    status: 'submitted'
  },
  {
    id: '20000000-0000-4000-8000-000000000015',
    gigId: gigs[9].id,
    workerId: users[5].id,
    intro: 'Based in Cebu for now but I will be in Davao that week and can do site work.',
    availability: 'Available on Apr 24.',
    status: 'submitted'
  }
]

const hires = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    gigId: gigs[2].id,
    applicationId: applications[4].id,
    posterId: gigs[2].posterId,
    workerId: applications[4].workerId,
    status: 'funded',
    fundedAt: '2026-04-21T01:30:00.000Z'
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    gigId: gigs[3].id,
    applicationId: applications[6].id,
    posterId: gigs[3].posterId,
    workerId: applications[6].workerId,
    status: 'in_progress',
    fundedAt: '2026-04-20T08:00:00.000Z'
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    gigId: gigs[4].id,
    applicationId: applications[8].id,
    posterId: gigs[4].posterId,
    workerId: applications[8].workerId,
    status: 'payout_ready',
    fundedAt: '2026-04-19T03:00:00.000Z'
  }
]

async function tableExists (client, schemaName, tableName) {
  const result = await client.query('select to_regclass($1) as value', [`${schemaName}.${tableName}`])
  return result.rows[0]?.value != null
}

async function upsertUsers (client) {
  for (const user of users) {
    await client.query(
      `
        insert into auth.users (
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          last_sign_in_at,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          created_at,
          updated_at,
          is_sso_user,
          is_anonymous
        )
        values (
          $1, 'authenticated', 'authenticated', $2, $3, $4, $4,
          $5::jsonb, $6::jsonb, false, $4, $4, false, false
        )
        on conflict (id) do update
        set
          email = excluded.email,
          aud = excluded.aud,
          role = excluded.role,
          encrypted_password = excluded.encrypted_password,
          email_confirmed_at = excluded.email_confirmed_at,
          last_sign_in_at = excluded.last_sign_in_at,
          raw_app_meta_data = excluded.raw_app_meta_data,
          raw_user_meta_data = excluded.raw_user_meta_data,
          updated_at = excluded.updated_at,
          is_sso_user = excluded.is_sso_user,
          is_anonymous = excluded.is_anonymous
      `,
      [
        user.id,
        user.email,
        TEST_PASSWORD_HASH,
        now,
        JSON.stringify({ provider: 'email', providers: ['email'] }),
        JSON.stringify({
          display_name: user.displayName,
          full_name: user.displayName,
          seed: true
        })
      ]
    )
  }
}

async function upsertProfiles (client) {
  for (const user of users) {
    await client.query(
      `
        insert into public.profiles (
          id,
          display_name,
          city,
          barangay,
          latitude,
          longitude,
          service_radius_km,
          bio,
          skills
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[])
        on conflict (id) do update
        set
          display_name = excluded.display_name,
          city = excluded.city,
          barangay = excluded.barangay,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          service_radius_km = excluded.service_radius_km,
          bio = excluded.bio,
          skills = excluded.skills
      `,
      [
        user.id,
        user.displayName,
        user.city,
        user.barangay,
        user.latitude,
        user.longitude,
        user.serviceRadiusKm,
        user.bio,
        user.skills
      ]
    )

    await client.query(
      `
        insert into public.user_stats (
          user_id,
          rating,
          review_count,
          jobs_completed,
          response_rate
        )
        values ($1, $2, $3, $4, $5)
        on conflict (user_id) do update
        set
          rating = excluded.rating,
          review_count = excluded.review_count,
          jobs_completed = excluded.jobs_completed,
          response_rate = excluded.response_rate
      `,
      [user.id, user.rating, user.reviewCount, user.jobsCompleted, user.responseRate]
    )
  }
}

async function deleteSeedRows (client, tables) {
  const userIds = users.map((user) => user.id)
  const gigIds = gigs.map((gig) => gig.id)
  const applicationIds = applications.map((application) => application.id)
  const hireIds = hires.map((hire) => hire.id)

  if (tables.hires) {
    await client.query(
      `
        delete from public.hires
        where id = any($1::uuid[])
          or gig_id = any($2::uuid[])
          or application_id = any($3::uuid[])
          or poster_id = any($4::uuid[])
          or worker_id = any($4::uuid[])
      `,
      [hireIds, gigIds, applicationIds, userIds]
    )
  }

  if (tables.gigApplications) {
    await client.query(
      `
        delete from public.gig_applications
        where id = any($1::uuid[])
          or gig_id = any($2::uuid[])
          or worker_id = any($3::uuid[])
      `,
      [applicationIds, gigIds, userIds]
    )
  }

  if (tables.gigPosts) {
    await client.query(
      `
        delete from public.gig_posts
        where id = any($1::uuid[])
          or poster_id = any($2::uuid[])
      `,
      [gigIds, userIds]
    )
  }
}

async function insertGigs (client) {
  for (const gig of gigs) {
    await client.query(
      `
        insert into public.gig_posts (
          id,
          poster_id,
          title,
          category,
          description,
          price_amount,
          currency,
          duration_bucket,
          city,
          barangay,
          latitude,
          longitude,
          application_radius_km,
          schedule_summary,
          starts_at,
          ends_at,
          status
        )
        values (
          $1, $2, $3, $4, $5, $6, 'PHP', $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16
        )
      `,
      [
        gig.id,
        gig.posterId,
        gig.title,
        gig.category,
        gig.description,
        gig.priceAmount,
        gig.durationBucket,
        gig.city,
        gig.barangay,
        gig.latitude,
        gig.longitude,
        gig.applicationRadiusKm,
        gig.scheduleSummary,
        gig.startsAt,
        gig.endsAt,
        gig.status
      ]
    )
  }
}

async function insertApplications (client, enabled) {
  if (!enabled) {
    return 0
  }

  for (const application of applications) {
    await client.query(
      `
        insert into public.gig_applications (
          id,
          gig_id,
          worker_id,
          intro,
          availability,
          status
        )
        values ($1, $2, $3, $4, $5, $6)
      `,
      [
        application.id,
        application.gigId,
        application.workerId,
        application.intro,
        application.availability,
        application.status
      ]
    )
  }

  return applications.length
}

async function insertHires (client, enabled) {
  if (!enabled) {
    return 0
  }

  for (const hire of hires) {
    await client.query(
      `
        insert into public.hires (
          id,
          gig_id,
          application_id,
          poster_id,
          worker_id,
          status,
          funded_at
        )
        values ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        hire.id,
        hire.gigId,
        hire.applicationId,
        hire.posterId,
        hire.workerId,
        hire.status,
        hire.fundedAt
      ]
    )
  }

  return hires.length
}

async function getCounts (client, tables) {
  const counts = {}

  counts.authUsers = Number((await client.query(
    'select count(*)::int as value from auth.users where id = any($1::uuid[])',
    [users.map((user) => user.id)]
  )).rows[0].value)

  counts.profiles = Number((await client.query(
    'select count(*)::int as value from public.profiles where id = any($1::uuid[])',
    [users.map((user) => user.id)]
  )).rows[0].value)

  counts.userStats = Number((await client.query(
    'select count(*)::int as value from public.user_stats where user_id = any($1::uuid[])',
    [users.map((user) => user.id)]
  )).rows[0].value)

  if (tables.gigPosts) {
    counts.gigPosts = Number((await client.query(
      'select count(*)::int as value from public.gig_posts where id = any($1::uuid[])',
      [gigs.map((gig) => gig.id)]
    )).rows[0].value)
  }

  if (tables.gigApplications) {
    counts.gigApplications = Number((await client.query(
      'select count(*)::int as value from public.gig_applications where id = any($1::uuid[])',
      [applications.map((application) => application.id)]
    )).rows[0].value)
  }

  if (tables.hires) {
    counts.hires = Number((await client.query(
      'select count(*)::int as value from public.hires where id = any($1::uuid[])',
      [hires.map((hire) => hire.id)]
    )).rows[0].value)
  }

  return counts
}

async function main () {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL
  })

  const client = await pool.connect()

  try {
    const tables = {
      gigPosts: await tableExists(client, 'public', 'gig_posts'),
      gigApplications: await tableExists(client, 'public', 'gig_applications'),
      hires: await tableExists(client, 'public', 'hires')
    }

    if (!tables.gigPosts) {
      throw new Error('Required table public.gig_posts does not exist. Run migrations first.')
    }

    await client.query('begin')

    await upsertUsers(client)
    await upsertProfiles(client)
    await deleteSeedRows(client, tables)
    await insertGigs(client)
    const applicationCount = await insertApplications(client, tables.gigApplications)
    const hireCount = await insertHires(client, tables.gigApplications && tables.hires)
    const counts = await getCounts(client, tables)

    await client.query('commit')

    console.log('Seed complete.')
    console.log(`- auth.users: ${counts.authUsers}`)
    console.log(`- public.profiles: ${counts.profiles}`)
    console.log(`- public.user_stats: ${counts.userStats}`)
    console.log(`- public.gig_posts: ${counts.gigPosts ?? 0}`)
    console.log(`- public.gig_applications: ${counts.gigApplications ?? 0} (${applicationCount} inserted this run)`)
    console.log(`- public.hires: ${counts.hires ?? 0} (${hireCount} inserted this run)`)
    console.log('Seed users use the email pattern seed.userNN@raket.local.')
  } catch (error) {
    await client.query('rollback')
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
