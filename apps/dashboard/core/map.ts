// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code

/** Geographic point with optional value for heatmap/intensity. */
export interface LatLng { lat: number; lng: number; value?: number }

/** Cluster representing aggregated points in a grid cell. */
export interface Cluster { lat: number; lng: number; count: number; sum?: number }

/**
 * Group geographic points into clusters for map visualization.
 * 
 * Aggregates point data into a grid-based cluster system for efficient rendering
 * on maps. Points within the same grid cell are combined into a single cluster
 * with count and optional sum of values.
 * 
 * @param points - Array of LatLng objects with lat, lng, and optional value
 * @param gridDeg - Grid cell size in degrees (default: 0.1 ≈ 11km at equator)
 * 
 * @returns Array of Cluster objects with aggregated data:
 *   - lat, lng: Cluster center coordinates (grid cell origin)
 *   - count: Number of points in this cluster
 *   - sum: Total value (if points had values)
 * 
 * @example
 * ```typescript
 * // From dashboard UI:
 * import { prepareClusterData } from "../core";
 * 
 * const locations = [
 *   { lat: 40.7128, lng: -74.0060, value: 10 },  // NYC
 *   { lat: 40.7580, lng: -73.9855, value: 15 },  // Times Square
 *   { lat: 34.0522, lng: -118.2437, value: 8 },  // LA
 * ];
 * 
 * const clusters = prepareClusterData(locations, 0.05);
 * // clusters = [
 * //   { lat: 40.70, lng: -74.00, count: 2, sum: 25 },  // NYC area
 * //   { lat: 34.05, lng: -118.25, count: 1, sum: 8 }   // LA area
 * // ]
 * 
 * clusters.forEach(c => {
 *   addMarker({ lat: c.lat, lng: c.lng, size: c.count, intensity: c.sum });
 * });
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export function prepareClusterData(points: LatLng[], gridDeg = 0.1): Cluster[] {
  const buckets = new Map<string, { lat: number; lng: number; count: number; sum: number }>();
  for (const p of points) {
    const by = Math.floor(p.lat / gridDeg), bx = Math.floor(p.lng / gridDeg);
    const key = `${by}:${bx}`;
    if (!buckets.has(key)) buckets.set(key, { lat: by * gridDeg, lng: bx * gridDeg, count: 0, sum: 0 });
    const b = buckets.get(key)!;
    b.count += 1; b.sum += p.value ?? 0;
  }
  return Array.from(buckets.values()).map(b => ({ lat: b.lat, lng: b.lng, count: b.count, sum: b.sum || undefined }));
}
