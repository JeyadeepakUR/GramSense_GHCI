// Stable type contracts for client-app core

export type PCMInput = Float32Array | Int16Array | ArrayBuffer;

export interface ProcessedAudio {
  sampleRate: number;
  durationMs: number;
  frames: Float32Array; // normalized -1..1 mono
}

export interface VADSegment {
  startMs: number;
  endMs: number;
  confidence: number; // 0..1
}

export interface EntitiesMap {
  intents: Array<{ name: string; score: number }>;
  entities: Array<{ type: string; text: string; start: number; end: number; score?: number }>;
}

export interface OfflineRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number; // epoch ms
}

export interface QueueItem<T = unknown> {
  id: string;
  payload: T;
  attempts: number;
  nextAttemptAt: number; // epoch ms
}
