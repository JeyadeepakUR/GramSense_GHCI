// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { ChartData, SeriesPoint } from "./types";

/**
 * Convert raw records into chart-ready series data grouped by a key.
 * 
 * Transforms flat database records or API responses into structured chart data
 * with series grouped by an identifier. Automatically sorts points by time.
 * 
 * @param records - Array of records (each record is an object)
 * @param timeKey - Field name for time/x-axis values (default: "timestamp")
 * @param valueKey - Field name for data/y-axis values (default: "value")
 * @param groupKey - Field name for series grouping (default: "series")
 * 
 * @returns ChartData object with series array, each containing:
 *   - id: Series identifier
 *   - points: Array of {t: number, v: number} sorted by time
 *   - stats: Optional aggregated statistics
 * 
 * @example
 * ```typescript
 * // From dashboard UI:
 * import { getChartData } from "../core";
 * 
 * const rawData = await fetch("/api/metrics").then(r => r.json());
 * // rawData = [
 * //   { timestamp: 1000, value: 10, region: "US" },
 * //   { timestamp: 2000, value: 15, region: "US" },
 * //   { timestamp: 1000, value: 8, region: "EU" },
 * // ]
 * 
 * const chartData = getChartData(rawData, "timestamp", "value", "region");
 * // chartData.series = [
 * //   { id: "US", points: [{t:1000, v:10}, {t:2000, v:15}] },
 * //   { id: "EU", points: [{t:1000, v:8}] }
 * // ]
 * 
 * <LineChart data={chartData.series} />
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export function getChartData(records: Array<Record<string, any>>, timeKey = "timestamp", valueKey = "value", groupKey = "series"): ChartData {
  const groups = new Map<string, SeriesPoint[]>();
  for (const r of records) {
    const id = String(r[groupKey] ?? "default");
    const t = Number(r[timeKey] ?? 0);
    const v = Number(r[valueKey] ?? 0);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push({ t, v });
  }
  const series = Array.from(groups.entries()).map(([id, points]) => ({ id, points: points.sort((a, b) => a.t - b.t) }));
  return { series };
}
