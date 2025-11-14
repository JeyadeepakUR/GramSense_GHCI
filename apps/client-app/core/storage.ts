// Core-only offline storage utilities (in-memory fallback)
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { OfflineRecord } from "./types";

const mem = new Map<string, OfflineRecord>();

/**
 * Save data to offline storage with a unique key.
 * 
 * Provides offline-first capability by persisting data locally. Current implementation
 * uses in-memory storage as a placeholder, but can be upgraded to IndexedDB or
 * LocalStorage without interface changes.
 * 
 * @param key - Unique identifier for the stored data
 * @param value - Data to store (any JSON-serializable type)
 * 
 * @returns Promise resolving to OfflineRecord with key, value, and timestamp
 * 
 * @example
 * ```typescript
 * import { saveOffline } from "../core";
 * 
 * const saveDraft = async (reportText: string) => {
 *   await saveOffline("draft_report", { text: reportText, version: 1 });
 *   console.log("Draft saved");
 * };
 * ```
 * 
 * @note Owner-only code. Can be upgraded to IndexedDB/LocalStorage.
 */
export async function saveOffline<T = unknown>(key: string, value: T): Promise<OfflineRecord<T>> {
  const rec: OfflineRecord<T> = { key, value, updatedAt: Date.now() };
  mem.set(key, rec as OfflineRecord);
  return rec;
}

/**
 * Load data from offline storage by key.
 * 
 * @param key - Unique identifier for the stored data
 * 
 * @returns Promise resolving to OfflineRecord if found, null otherwise
 * 
 * @example
 * ```typescript
 * import { loadOffline } from "../core";
 * 
 * const loadDraft = async () => {
 *   const record = await loadOffline("draft_report");
 *   if (record) {
 *     setReportText(record.value.text);
 *   }
 * };
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export async function loadOffline<T = unknown>(key: string): Promise<OfflineRecord<T> | null> {
  return (mem.get(key) as OfflineRecord<T>) ?? null;
}

/**
 * Remove data from offline storage by key.
 * 
 * @param key - Unique identifier for the data to remove
 * 
 * @returns Promise resolving to true if deleted, false if not found
 * 
 * @example
 * ```typescript
 * import { removeOffline } from "../core";
 * 
 * const clearDraft = async () => {
 *   const success = await removeOffline("draft_report");
 *   console.log(success ? "Cleared" : "Not found");
 * };
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export async function removeOffline(key: string): Promise<boolean> {
  return mem.delete(key);
}
