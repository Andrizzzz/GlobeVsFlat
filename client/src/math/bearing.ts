/**
 * Spherical bearing calculations for the Globe model.
 *
 * Assumptions:
 * - Earth is a perfect sphere.
 * - Input coordinates are in decimal degrees.
 * - Bearing is measured clockwise from True North (0° = North, 90° = East).
 *
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html
 */

import { toRadians } from './haversine';

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the initial (forward) bearing from point 1 to point 2 on a sphere.
 * @param lat1 - Latitude of point 1 in degrees
 * @param lon1 - Longitude of point 1 in degrees
 * @param lat2 - Latitude of point 2 in degrees
 * @param lon2 - Longitude of point 2 in degrees
 * @returns Initial bearing in degrees (0-360)
 */
export function sphericalBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lon2 - lon1);

  const x = Math.sin(deltaLambda) * Math.cos(phi2);
  const y =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(x, y);

  return ((toDegrees(theta) % 360) + 360) % 360;
}
