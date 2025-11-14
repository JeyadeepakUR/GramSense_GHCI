// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { Pagination } from "./types";

/**
 * Paginate an array of items with page number and page size.
 * 
 * Splits a large array into pages for efficient rendering and user navigation.
 * Handles edge cases like invalid page numbers and empty arrays.
 * 
 * @param items - Full array of items to paginate
 * @param page - Current page number (1-indexed, e.g., 1 for first page)
 * @param pageSize - Number of items per page
 * 
 * @returns Pagination object containing:
 *   - items: Array slice for the current page
 *   - total: Total number of items across all pages
 *   - page: Current page number (echoed back)
 *   - pageSize: Page size (echoed back)
 * 
 * @example
 * ```typescript
 * // From dashboard UI:
 * import { paginate } from "../core";
 * 
 * const [currentPage, setCurrentPage] = useState(1);
 * const allReports = await fetchAllReports();
 * 
 * const paginatedData = paginate(allReports, currentPage, 20);
 * 
 * <Table data={paginatedData.items} />
 * <Pagination 
 *   current={paginatedData.page} 
 *   total={Math.ceil(paginatedData.total / paginatedData.pageSize)}
 *   onChange={setCurrentPage}
 * />
 * ```
 * 
 * @note Owner-only code. Page numbers are 1-indexed. UI developers should NOT modify.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): Pagination<T> {
  const total = items.length;
  const start = Math.max(0, (page - 1) * pageSize);
  const end = Math.min(total, start + pageSize);
  return { items: items.slice(start, end), total, page, pageSize };
}
