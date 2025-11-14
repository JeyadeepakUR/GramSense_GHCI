// Core-only NLU extraction helpers
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { EntitiesMap } from "./types";

/**
 * Extract intents and entities from text using Natural Language Understanding.
 * 
 * Performs named entity recognition (NER) and intent classification on input text.
 * Current implementation uses regex patterns for numbers and dates as placeholders,
 * which can be upgraded to transformer models without interface changes.
 * 
 * @param text - Input text string to analyze
 * 
 * @returns EntitiesMap object containing:
 *   - intents: Array of detected intents with confidence scores
 *   - entities: Array of extracted entities (numbers, dates, etc.) with positions
 * 
 * @example
 * ```typescript
 * // From UI component:
 * import { extractEntities } from "../core";
 * 
 * const handleTranscript = (transcript: string) => {
 *   const result = extractEntities(transcript);
 *   
 *   // Display intents
 *   result.intents.forEach(intent => {
 *     console.log(`Intent: ${intent.name} (${intent.score})`);
 *   });
 *   
 *   // Highlight entities in UI
 *   result.entities.forEach(entity => {
 *     if (entity.type === "date") {
 *       highlightText(entity.start, entity.end, "date");
 *     }
 *   });
 * };
 * ```
 * 
 * @note Owner-only code. Can be upgraded to BERT/spaCy/Transformers.
 *       UI developers should NOT modify this file.
 */
export function extractEntities(text: string): EntitiesMap {
  const entities: EntitiesMap["entities"] = [];
  const intents: EntitiesMap["intents"] = [];

  // numbers
  const numRegex = /(?<!\w)(\d+(?:\.\d+)?)(?!\w)/g;
  for (const m of text.matchAll(numRegex)) {
    entities.push({ type: "number", text: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }

  // dates (very naive)
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g;
  for (const m of text.matchAll(dateRegex)) {
    entities.push({ type: "date", text: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }

  // dummy intent
  if (/summary|summarize/i.test(text)) intents.push({ name: "get_summary", score: 0.6 });

  return { intents, entities };
}
