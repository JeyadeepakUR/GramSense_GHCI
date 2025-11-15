// Core-only audio processing adapters
// Owner-implemented. UI should call processAudio() from src via import.
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code

import type { PCMInput, ProcessedAudio } from "./types";

/**
 * Normalize input PCM to mono Float32Array and compute basic metadata.
 * 
 * This function accepts raw audio data in multiple formats (Float32Array, Int16Array, or ArrayBuffer)
 * and converts it to a standardized normalized mono Float32Array format for further processing.
 * 
 * @param input - Raw PCM audio data in various formats:
 *   - Float32Array: Already normalized (-1 to 1)
 *   - Int16Array: 16-bit PCM audio
 *   - ArrayBuffer: Raw binary audio data (treated as Int16)
 * @param sampleRateHint - Optional sample rate in Hz (default: 16000)
 * 
 * @returns Promise<ProcessedAudio> containing:
 *   - sampleRate: Audio sample rate in Hz
 *   - durationMs: Audio duration in milliseconds
 *   - frames: Normalized mono audio as Float32Array (-1 to 1)
 * 
 * @example
 * ```typescript
 * // From UI component:
 * import { processAudio } from "../core";
 * 
 * const handleMicInput = async (buffer: ArrayBuffer) => {
 *   const processed = await processAudio(buffer, 16000);
 *   console.log(`Duration: ${processed.durationMs}ms`);
 *   // Use processed.frames for VAD or transcription
 * };
 * ```
 * 
 * @note This is owner-only code. Implementation can be upgraded to use Whisper/ONNX
 *       without changing the interface. UI developers should NOT modify this file.
 */
export async function processAudio(input: PCMInput, sampleRateHint?: number): Promise<ProcessedAudio> {
  const pcm = toFloat32(input);
  return {
    sampleRate: sampleRateHint ?? 16000,
    durationMs: Math.round((pcm.length / (sampleRateHint ?? 16000)) * 1000),
    frames: pcm,
  };
}

function toFloat32(input: PCMInput): Float32Array {
  if (input instanceof Float32Array) return input;
  if (input instanceof Int16Array) {
    const out = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) out[i] = input[i] / 32768;
    return out;
  }
  if (input instanceof ArrayBuffer) {
    // naive fallback: treat as Int16 PCM
    const view = new Int16Array(input);
    return toFloat32(view);
  }
  // last-resort fallback
  return new Float32Array();
}
