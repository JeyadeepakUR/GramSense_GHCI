// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { SeriesPoint } from "./types";

/**
 * Aggregate time-series data by averaging values within time windows.
 * 
 * Reduces high-resolution time-series data by grouping points into time buckets
 * and computing the mean for each bucket. Useful for downsampling large datasets
 * for visualization.
 * 
 * @param points - Array of SeriesPoint objects ({t: number, v: number})
 * @param windowMs - Time window size in milliseconds for aggregation buckets
 * 
 * @returns Array of aggregated SeriesPoint objects with averaged values
 * 
 * @example
 * ```typescript
 * // From dashboard UI:
 * import { getChartData, aggregateTimeSeries } from "../core";
 * 
 * const rawData = await fetch("/api/metrics?resolution=1min").then(r => r.json());
 * const chartData = getChartData(rawData);
 * 
 * // Aggregate each series to hourly buckets (3600000ms = 1 hour)
 * const aggregated = chartData.series.map(s => ({
 *   ...s,
 *   points: aggregateTimeSeries(s.points, 3600000)
 * }));
 * 
 * <LineChart data={aggregated} />
 * ```
 * 
 * @note Owner-only code. Returns input unchanged if windowMs <= 1.
 */
export function aggregateTimeSeries(points: SeriesPoint[], windowMs: number): SeriesPoint[] {
  if (!windowMs || windowMs <= 1) return points.slice();
  const out: SeriesPoint[] = [];
  let bucketStart = points.length ? points[0].t : 0;
  let acc = 0, n = 0;
  for (const p of points) {
    if (p.t >= bucketStart + windowMs) {
      if (n) out.push({ t: bucketStart, v: acc / n });
      bucketStart = p.t;
      acc = 0; n = 0;
    }
    acc += p.v; n += 1;
  }
  if (n) out.push({ t: bucketStart, v: acc / n });
  return out;
}
