// Core-only VAD wrapper with stable contract
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code
import type { VADSegment } from "./types";

/**
 * Detect voice activity (speech segments) in audio frames.
 * 
 * Uses energy-based Voice Activity Detection to identify time ranges where speech is present.
 * This is a placeholder implementation that can be upgraded to a neural VAD model without
 * changing the interface.
 * 
 * @param frames - Normalized audio frames as Float32Array (-1 to 1)
 * @param sampleRate - Audio sample rate in Hz (default: 16000)
 * 
 * @returns Array of VADSegment objects, each containing:
 *   - startMs: Speech segment start time in milliseconds
 *   - endMs: Speech segment end time in milliseconds
 *   - confidence: Detection confidence score (0-1)
 * 
 * @example
 * ```typescript
 * // From UI component:
 * import { processAudio, detectVoiceActivity } from "../core";
 * 
 * const analyzeAudio = async (buffer: ArrayBuffer) => {
 *   const processed = await processAudio(buffer);
 *   const segments = detectVoiceActivity(processed.frames, processed.sampleRate);
 *   
 *   segments.forEach(seg => {
 *     console.log(`Speech: ${seg.startMs}ms - ${seg.endMs}ms (${seg.confidence})`);
 *   });
 * };
 * ```
 * 
 * @note Owner-only code. Can be replaced with Silero VAD or other ML models.
 *       UI developers should NOT modify this file.
 */
export function detectVoiceActivity(frames: Float32Array, sampleRate = 16000): VADSegment[] {
  if (frames.length === 0) return [];
  const windowMs = 30;
  const step = Math.floor((windowMs / 1000) * sampleRate);
  const segments: VADSegment[] = [];
  let inSpeech = false;
  let segStart = 0;

  for (let i = 0; i < frames.length; i += step) {
    let energy = 0;
    const end = Math.min(i + step, frames.length);
    for (let j = i; j < end; j++) energy += Math.abs(frames[j]);
    energy /= end - i || 1;

    const speech = energy > 0.02; // heuristic threshold
    if (speech && !inSpeech) {
      inSpeech = true;
      segStart = i;
    } else if (!speech && inSpeech) {
      inSpeech = false;
      segments.push({ startMs: (segStart / sampleRate) * 1000, endMs: (i / sampleRate) * 1000, confidence: 0.6 });
    }
  }
  if (inSpeech) segments.push({ startMs: (segStart / sampleRate) * 1000, endMs: (frames.length / sampleRate) * 1000, confidence: 0.6 });
  return segments;
}
