// Core-only sync queue & retry logic (in-memory placeholder)
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { QueueItem } from "./types";

const q: QueueItem[] = [];

/**
 * Add an item to the sync queue with optional delay.
 * 
 * Queues data for background synchronization. Items are processed by the flush() function
 * with automatic retry on failure using exponential backoff.
 * 
 * @param payload - Data to sync (any type)
 * @param delayMs - Optional delay in milliseconds before first attempt (default: 0)
 * 
 * @returns QueueItem with id, payload, attempts counter, and nextAttemptAt timestamp
 * 
 * @example
 * ```typescript
 * import { enqueue } from "../core";
 * 
 * const queueReport = (reportData: any) => {
 *   const item = enqueue(reportData, 0);
 *   console.log(`Queued with ID: ${item.id}`);
 * };
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export function enqueue<T = unknown>(payload: T, delayMs = 0): QueueItem<T> {
  const item: QueueItem<T> = {
    id: Math.random().toString(36).slice(2),
    payload,
    attempts: 0,
    nextAttemptAt: Date.now() + delayMs,
  };
  q.push(item as QueueItem);
  return item;
}

/**
 * Process queued items with a handler function, implementing automatic retry on failure.
 * 
 * Iterates through the queue and calls the handler for each item that's due for processing.
 * Failed items are automatically retried with exponential backoff (1s, 2s, 4s, ..., max 60s).
 * Successfully processed items are removed from the queue.
 * 
 * @param handler - Async function to process each payload. Should throw on failure.
 * @param now - Current timestamp in ms (default: Date.now(), useful for testing)
 * 
 * @returns Promise resolving to object with processed count
 * 
 * @example
 * ```typescript
 * import { flush } from "../core";
 * 
 * // Call periodically (e.g., every 30 seconds)
 * const syncQueue = async () => {
 *   const result = await flush(async (payload) => {
 *     await fetch("/api/sync", {
 *       method: "POST",
 *       body: JSON.stringify(payload)
 *     });
 *   });
 *   console.log(`Synced ${result.processed} items`);
 * };
 * 
 * setInterval(syncQueue, 30000);
 * ```
 * 
 * @note Owner-only code. Implements exponential backoff automatically.
 */
export async function flush<T = unknown>(handler: (p: T) => Promise<void>, now = Date.now()): Promise<{ processed: number }>{
  let processed = 0;
  for (const item of q) {
    if (item.nextAttemptAt > now) continue;
    try {
      item.attempts++;
      await handler(item.payload as T);
      item.nextAttemptAt = Number.POSITIVE_INFINITY; // mark done
      processed++;
    } catch {
      // exponential backoff
      const backoff = Math.min(60000, 1000 * Math.pow(2, Math.max(0, item.attempts - 1)));
      item.nextAttemptAt = Date.now() + backoff;
    }
  }
  // drop completed
  for (let i = q.length - 1; i >= 0; i--) if (q[i].nextAttemptAt === Number.POSITIVE_INFINITY) q.splice(i, 1);
  return { processed };
}
