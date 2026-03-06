/**
 * Azimuthal Equidistant Projection centered at the North Pole.
 *
 * This projection maps lat/lon coordinates to a 2D plane where:
 * - The North Pole is at the center (0, 0).
 * - Distance from the center is proportional to the angular distance from the pole.
 * - Direction from the center is the true bearing (longitude).
 *
 * Assumptions:
 * - Earth is modeled as a sphere with radius 6371 km.
 * - All flat-model distances and bearings are computed in this projected plane,
 *   NOT from any image distortion.
 *
 * Formulas:
 *   r = R * (pi/2 - latitude_in_radians)   [distance from pole in km]
 *   x = r * sin(longitude_in_radians)
 *   y = -r * cos(longitude_in_radians)
 *
 * The negative sign on y ensures that 0 longitude points "up" (North on a standard map),
 * matching the convention where the Prime Meridian extends downward from the pole.
 */

import { EARTH_RADIUS_KM, toRadians } from './haversine';
import { toDegrees } from './bearing';

/**
 * Convert geographic coordinates (lat/lon) to Azimuthal Equidistant projected coordinates.
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lon - Longitude in degrees (-180 to 180)
 * @returns Projected coordinates in kilometers
 */
export function latLonToAzimuthal(lat: number, lon: number): { x: number; y: number } {
  const latRad = toRadians(lat);
  const lonRad = toRadians(lon);

  const r = EARTH_RADIUS_KM * (Math.PI / 2 - latRad);

  const x = r * Math.sin(lonRad);
  const y = -r * Math.cos(lonRad);

  return { x, y };
}

/**
 * Compute Euclidean distance between two points in the Azimuthal Equidistant projected plane.
 * This gives the "flat Earth" distance.
 */
export function flatDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = latLonToAzimuthal(lat1, lon1);
  const p2 = latLonToAzimuthal(lat2, lon2);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Compute bearing between two points in the Azimuthal Equidistant projected plane.
 * Bearing is measured clockwise from the positive Y-axis (North).
 */
export function flatBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = latLonToAzimuthal(lat1, lon1);
  const p2 = latLonToAzimuthal(lat2, lon2);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const theta = Math.atan2(dx, dy);
  return ((toDegrees(theta) % 360) + 360) % 360;
}

/**
 * Convert Azimuthal Equidistant projected coordinates back to lat/lon.
 */
export function azimuthalToLatLon(x: number, y: number): { lat: number; lon: number } {
  const r = Math.sqrt(x * x + y * y);

  if (r < 0.001) {
    return { lat: 90, lon: 0 };
  }

  const latRad = Math.PI / 2 - r / EARTH_RADIUS_KM;
  const lonRad = Math.atan2(x, -y);

  let lat = toDegrees(latRad);
  let lon = toDegrees(lonRad);

  lat = Math.max(-90, Math.min(90, lat));
  lon = ((lon + 180) % 360 + 360) % 360 - 180;

  return { lat, lon };
}
