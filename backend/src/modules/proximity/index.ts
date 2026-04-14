export const DEFAULT_SERVICE_RADIUS_KM = 25
export const DEFAULT_GIG_APPLICATION_RADIUS_KM = 25

const EARTH_RADIUS_KM = 6371

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface WorkerServiceArea extends GeoPoint {
  serviceRadiusKm: number
}

export interface GigServiceArea extends GeoPoint {
  applicationRadiusKm: number
}

export type GigEligibilityResult =
  | {
    eligible: true
    distanceKm: number
  }
  | {
    eligible: false
    reason: 'worker_location_missing' | 'outside_worker_service_radius' | 'outside_gig_application_radius'
    distanceKm: number | null
  }

function toRadians (value: number): number {
  return value * (Math.PI / 180)
}

export function haversineDistanceKm (origin: GeoPoint, destination: GeoPoint): number {
  const latitudeDelta = toRadians(destination.latitude - origin.latitude)
  const longitudeDelta = toRadians(destination.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const destinationLatitude = toRadians(destination.latitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) *
    Math.sin(longitudeDelta / 2) ** 2

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function roundDistanceKm (value: number): number {
  return Math.round(value * 100) / 100
}

export function assessGigEligibility (
  worker: WorkerServiceArea | null,
  gig: GigServiceArea
): GigEligibilityResult {
  if (worker == null) {
    return {
      eligible: false,
      reason: 'worker_location_missing',
      distanceKm: null
    }
  }

  const distanceKm = haversineDistanceKm(worker, gig)

  if (distanceKm > worker.serviceRadiusKm) {
    return {
      eligible: false,
      reason: 'outside_worker_service_radius',
      distanceKm: roundDistanceKm(distanceKm)
    }
  }

  if (distanceKm > gig.applicationRadiusKm) {
    return {
      eligible: false,
      reason: 'outside_gig_application_radius',
      distanceKm: roundDistanceKm(distanceKm)
    }
  }

  return {
    eligible: true,
    distanceKm: roundDistanceKm(distanceKm)
  }
}
