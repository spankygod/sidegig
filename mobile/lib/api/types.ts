export type GigCategory =
  | 'errands_personal_assistance'
  | 'cleaning_home_help'
  | 'moving_help'
  | 'construction_helper'
  | 'tutoring_academic_support'
  | 'graphic_design_creative'
  | 'photo_video_support'
  | 'virtual_assistance_admin'
  | 'event_staffing';

export type DurationBucket =
  | 'same_day'
  | 'two_to_seven_days'
  | 'eight_to_fourteen_days'
  | 'fifteen_to_thirty_days';

export type GigStatus =
  | 'draft'
  | 'published'
  | 'funded'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'closed';

export type ManageableGigStatus = Extract<GigStatus, 'draft' | 'published' | 'closed' | 'cancelled'>;

export type ApplicationStatus =
  | 'submitted'
  | 'rejected'
  | 'withdrawn'
  | 'hired'
  | 'closed';

export type HireStatus =
  | 'pending_funding'
  | 'funded'
  | 'accepted'
  | 'in_progress'
  | 'worker_marked_done'
  | 'poster_accepted'
  | 'disputed'
  | 'refunded'
  | 'payout_ready'
  | 'paid_out';

export type PaymentStatus = 'paid' | 'refunded' | 'failed';

export type PayoutStatus = 'pending' | 'paid' | 'cancelled';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'cancelled';

export type ChatThreadContext = 'application' | 'hire';

export type HireMilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type NotificationType =
  | 'application_received'
  | 'application_reviewed'
  | 'hire_updated'
  | 'chat_message'
  | 'dispute_opened'
  | 'review_received'
  | 'system';

export interface PublicGig {
  id: string;
  title: string;
  category: GigCategory;
  description: string;
  priceAmount: number;
  currency: 'PHP';
  durationBucket: DurationBucket;
  status: GigStatus;
  applicationRadiusKm: number;
  distanceKm: number | null;
  scheduleSummary: string;
  startsAt: string | null;
  endsAt: string | null;
  location: {
    city: string;
    barangay: string;
    exactPinVisible: false;
  };
  poster: {
    id: string;
    displayName: string;
    rating: number;
    reviewCount: number;
    jobsCompleted: number;
    responseRate: number;
  };
  construction: {
    supervisorPresent: boolean;
    ppeProvided: boolean;
    helperOnlyConfirmation: boolean;
    physicalLoad: string | null;
  } | null;
  createdAt: string;
}

export interface CreateGigInput {
  title: string;
  category: GigCategory;
  description: string;
  priceAmount: number;
  durationBucket: DurationBucket;
  city: string;
  barangay: string;
  latitude: number;
  longitude: number;
  applicationRadiusKm?: number;
  scheduleSummary: string;
  supervisorPresent?: boolean;
  ppeProvided?: boolean;
  helperOnlyConfirmation?: boolean;
  physicalLoad?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: Extract<GigStatus, 'draft' | 'published'>;
}

export interface CreatedGig extends Omit<PublicGig, 'location'> {
  location: {
    city: string;
    barangay: string;
    latitude: number;
    longitude: number;
    exactPinVisible: true;
  };
}

export interface UpdateGigInput {
  title?: string;
  category?: GigCategory;
  description?: string;
  priceAmount?: number;
  durationBucket?: DurationBucket;
  city?: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  applicationRadiusKm?: number;
  scheduleSummary?: string;
  supervisorPresent?: boolean;
  ppeProvided?: boolean;
  helperOnlyConfirmation?: boolean;
  physicalLoad?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: ManageableGigStatus;
}

export interface OwnedGig {
  id: string;
  title: string;
  category: GigCategory;
  description: string;
  priceAmount: number;
  currency: 'PHP';
  durationBucket: DurationBucket;
  status: GigStatus;
  applicationRadiusKm: number;
  distanceKm: null;
  scheduleSummary: string;
  startsAt: string | null;
  endsAt: string | null;
  location: {
    city: string;
    barangay: string;
    latitude: number;
    longitude: number;
    exactPinVisible: true;
  };
  construction: PublicGig['construction'];
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

export interface PosterGigApplicationSummary {
  id: string;
  status: ApplicationStatus;
  intro: string;
  availability: string;
  createdAt: string;
  updatedAt: string;
  worker: {
    id: string;
    displayName: string;
    city: string | null;
    barangay: string | null;
    bio: string | null;
    skills: string[];
    stats: {
      rating: number;
      reviewCount: number;
      jobsCompleted: number;
      responseRate: number;
    };
  };
}

export interface HireSummary {
  id: string;
  gigId: string;
  applicationId: string;
  posterId: string;
  workerId: string;
  status: HireStatus;
  fundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile {
  id: string;
  displayName: string;
  city: string | null;
  barangay: string | null;
  bio: string | null;
  skills: string[];
  stats: {
    rating: number;
    reviewCount: number;
    jobsCompleted: number;
    responseRate: number;
  };
}

export interface UpdateUserProfileInput {
  displayName?: string;
  city?: string | null;
  barangay?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadiusKm?: number;
  bio?: string | null;
  skills?: string[];
}

export interface HireWorkDetail {
  viewerRole: 'poster' | 'worker';
  hire: HireSummary;
  gig: {
    id: string;
    title: string;
    category: GigCategory;
    description: string;
    priceAmount: number;
    currency: 'PHP';
    durationBucket: DurationBucket;
    status: GigStatus;
    applicationRadiusKm: number;
    scheduleSummary: string;
    startsAt: string | null;
    endsAt: string | null;
    location: {
      city: string;
      barangay: string;
      latitude: number;
      longitude: number;
      exactPinVisible: true;
    };
    construction: PublicGig['construction'];
    createdAt: string;
    updatedAt: string;
  };
  application: {
    id: string;
    status: ApplicationStatus;
    intro: string;
    availability: string;
    createdAt: string;
    updatedAt: string;
  };
  poster: PublicUserProfile;
  worker: PublicUserProfile;
}

export interface GigApplicationSummary {
  id: string;
  status: ApplicationStatus;
  intro: string;
  availability: string;
  createdAt: string;
  gig: {
    id: string;
    title: string;
    category: GigCategory;
    city: string;
    barangay: string;
    status: GigStatus;
  };
}

export interface PaymentSummary {
  id: string;
  hireId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerReference: string | null;
  paidAt: string;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockPaymongoCheckout {
  provider: 'paymongo_mock';
  providerReference: string;
  checkoutUrl: string;
  status: 'paid';
}

export interface ChatThreadSummary {
  id: string;
  contextType: ChatThreadContext;
  applicationId: string | null;
  hireId: string | null;
  posterId: string;
  workerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageSummary {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface HireMilestoneSummary {
  id: string;
  hireId: string;
  createdBy: string;
  title: string;
  description: string | null;
  status: HireMilestoneStatus;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeSummary {
  id: string;
  hireId: string;
  openedBy: string;
  posterId: string;
  workerId: string;
  reason: string;
  details: string | null;
  status: DisputeStatus;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  id: string;
  hireId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    displayName: string;
    city: string | null;
    barangay: string | null;
  };
}

export interface NotificationSummary {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  entityType: string;
  entityId: string | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface HealthResponse {
  service: string;
  environment: string;
  status: 'ok' | 'degraded';
  timestamp: string;
  dependencies: {
    postgres: {
      status: 'up' | 'down';
      latencyMs: number;
      details?: string;
    };
  };
}

export interface AuthUserResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    isAnonymous: boolean;
    appMetadata: Record<string, unknown>;
    userMetadata: Record<string, unknown>;
  } | null;
}

export interface ProfileResponse {
  profile: PublicUserProfile & {
    latitude: number | null;
    longitude: number | null;
    serviceRadiusKm: number;
  };
}

export const gigCategoryLabels: Record<GigCategory, string> = {
  errands_personal_assistance: 'Errands',
  cleaning_home_help: 'Cleaning',
  moving_help: 'Moving',
  construction_helper: 'Construction',
  tutoring_academic_support: 'Tutoring',
  graphic_design_creative: 'Creative',
  photo_video_support: 'Photo & Video',
  virtual_assistance_admin: 'Virtual Assist',
  event_staffing: 'Events',
};

export const durationBucketLabels: Record<DurationBucket, string> = {
  same_day: 'Same day',
  two_to_seven_days: '2 to 7 days',
  eight_to_fourteen_days: '8 to 14 days',
  fifteen_to_thirty_days: '15 to 30 days',
};
