// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { Filter } from "./types";

/**
 * Apply multiple filter conditions to an array of items.
 * 
 * Filters an array based on multiple criteria with various comparison operators.
 * All filters must match (AND logic) for an item to be included.
 * 
 * @param items - Array of items to filter (each item is an object)
 * @param filters - Array of Filter objects with field, op, and value
 * 
 * @returns Filtered array containing only items matching ALL filters
 * 
 * Supported operators:
 *   - "eq": equals
 *   - "neq": not equals
 *   - "gt": greater than
 *   - "gte": greater than or equal
 *   - "lt": less than
 *   - "lte": less than or equal
 *   - "in": value in array
 *   - "contains": string contains substring
 * 
 * @example
 * ```typescript
 * // From dashboard UI:
 * import { applyFilters } from "../core";
 * 
 * const allRecords = await fetchRecords();
 * 
 * const filters = [
 *   { field: "status", op: "eq", value: "active" },
 *   { field: "score", op: "gte", value: 70 },
 *   { field: "region", op: "in", value: ["US", "CA", "MX"] },
 *   { field: "description", op: "contains", value: "urgent" }
 * ];
 * 
 * const filtered = applyFilters(allRecords, filters);
 * <Table data={filtered} />
 * ```
 * 
 * @note Owner-only code. Uses AND logic (all filters must match).
 */
export function applyFilters<T extends Record<string, any>>(items: T[], filters: Filter[]): T[] {
  return items.filter(item => filters.every(f => match(item[f.field], f.op, f.value)));
}

/**
 * Internal helper to match a value against a filter operator.
 * @internal
 */
function match(a: any, op: Filter["op"], b: any): boolean {
  switch (op) {
    case "eq": return a === b;
    case "neq": return a !== b;
    case "gt": return a > b;
    case "gte": return a >= b;
    case "lt": return a < b;
    case "lte": return a <= b;
    case "in": return Array.isArray(b) && b.includes(a);
    case "contains": return typeof a === "string" && String(a).includes(String(b));
  }
}
