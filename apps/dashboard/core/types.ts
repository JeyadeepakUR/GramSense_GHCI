export interface SeriesPoint { t: number; v: number }
export interface ChartData { series: Array<{ id: string; points: SeriesPoint[] }>; stats?: Record<string, number> }
export interface Pagination<T> { items: T[]; total: number; page: number; pageSize: number }
export interface Filter { field: string; op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains"; value: any }
