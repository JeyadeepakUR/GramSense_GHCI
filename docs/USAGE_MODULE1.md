# Module 1: Client App – Developer Usage Guide

## 🎯 Your Responsibilities

You are working on **Module 1: Client App** (`apps/client-app/`).

### ✅ What You CAN Touch
- **`apps/client-app/src/`** – All UI components, React code, styling, routing

### ⛔ What You CANNOT Touch
- **`apps/client-app/core/`** – Owner-only business logic (DO NOT MODIFY)
- **`ml/`** – Owner-only machine learning models
- **`infra/`** – Owner-only infrastructure
- **`security/`** – Owner-only security utilities

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│  apps/client-app/src/  (YOUR CODE)          │
│  - React Components                         │
│  - UI State Management                      │
│  - User Interactions                        │
└──────────────┬──────────────────────────────┘
               │ imports from "../core"
               ▼
┌─────────────────────────────────────────────┐
│  apps/client-app/core/  (OWNER-ONLY)        │
│  - Audio Processing                         │
│  - VAD (Voice Activity Detection)           │
│  - NLU (Natural Language Understanding)     │
│  - Offline Storage                          │
│  - Sync Queue & Retry Logic                 │
│  - Encryption Helpers                       │
└─────────────────────────────────────────────┘
```

**Flow**: UI calls core functions → core does the heavy lifting → returns results to UI

---

## 📦 Available Core Functions

All core functions are imported from `"../core"`:

```typescript
import { 
  processAudio, 
  detectVoiceActivity, 
  extractEntities,
  saveOffline,
  loadOffline,
  removeOffline,
  enqueue,
  flush,
  encrypt,
  decrypt
} from "../core";
```

---

## 🔧 Function Reference

### 1. `processAudio(input, sampleRateHint?)`

**Purpose**: Normalize raw audio input to a standard format for processing.

**Input**:
- `input`: `Float32Array | Int16Array | ArrayBuffer` – Raw PCM audio data
- `sampleRateHint?`: `number` (optional) – Sample rate in Hz (default: 16000)

**Output**: `Promise<ProcessedAudio>`
```typescript
{
  sampleRate: number;      // Audio sample rate
  durationMs: number;      // Duration in milliseconds
  frames: Float32Array;    // Normalized mono audio (-1 to 1)
}
```

**Example Usage**:
```typescript
// In your React component
const handleAudioCapture = async (rawBuffer: ArrayBuffer) => {
  try {
    const processed = await processAudio(rawBuffer, 16000);
    console.log(`Duration: ${processed.durationMs}ms`);
    // Use processed.frames for further processing
  } catch (error) {
    console.error("Audio processing failed:", error);
  }
};
```

---

### 2. `detectVoiceActivity(frames, sampleRate?)`

**Purpose**: Detect speech segments in audio (Voice Activity Detection).

**Input**:
- `frames`: `Float32Array` – Normalized audio frames
- `sampleRate?`: `number` (optional) – Sample rate in Hz (default: 16000)

**Output**: `VADSegment[]`
```typescript
{
  startMs: number;    // Speech segment start time
  endMs: number;      // Speech segment end time
  confidence: number; // Detection confidence (0-1)
}[]
```

**Example Usage**:
```typescript
const analyzeAudio = async (audioBuffer: ArrayBuffer) => {
  const processed = await processAudio(audioBuffer);
  const segments = detectVoiceActivity(processed.frames, processed.sampleRate);
  
  segments.forEach(seg => {
    console.log(`Speech from ${seg.startMs}ms to ${seg.endMs}ms`);
  });
};
```

---

### 3. `extractEntities(text)`

**Purpose**: Extract intents and entities from text using NLU.

**Input**:
- `text`: `string` – Text to analyze

**Output**: `EntitiesMap`
```typescript
{
  intents: Array<{
    name: string;    // Intent name (e.g., "get_summary")
    score: number;   // Confidence score (0-1)
  }>;
  entities: Array<{
    type: string;    // Entity type (e.g., "date", "number")
    text: string;    // Extracted text
    start: number;   // Character position start
    end: number;     // Character position end
    score?: number;  // Optional confidence
  }>;
}
```

**Example Usage**:
```typescript
const handleTranscript = (transcript: string) => {
  const result = extractEntities(transcript);
  
  console.log("Detected intents:", result.intents);
  console.log("Found entities:", result.entities);
  
  // Use in your UI
  result.entities.forEach(entity => {
    if (entity.type === "date") {
      highlightDate(entity.text);
    }
  });
};
```

---

### 4. `saveOffline(key, value)` / `loadOffline(key)` / `removeOffline(key)`

**Purpose**: Store, retrieve, and delete data for offline-first functionality.

**Input**:
- `key`: `string` – Unique identifier
- `value`: `any` – Data to store (any JSON-serializable type)

**Output**: `Promise<OfflineRecord>` or `Promise<OfflineRecord | null>` or `Promise<boolean>`

```typescript
{
  key: string;
  value: T;          // Your stored data
  updatedAt: number; // Timestamp (epoch ms)
}
```

**Example Usage**:
```typescript
// Save user input offline
const saveDraft = async (reportText: string) => {
  await saveOffline("draft_report", { text: reportText, timestamp: Date.now() });
  console.log("Draft saved offline");
};

// Load saved draft
const loadDraft = async () => {
  const record = await loadOffline("draft_report");
  if (record) {
    setReportText(record.value.text);
  }
};

// Delete draft
const clearDraft = async () => {
  await removeOffline("draft_report");
};
```

---

### 5. `enqueue(payload, delayMs?)` / `flush(handler)`

**Purpose**: Queue items for background sync with automatic retry on failure.

**Input (enqueue)**:
- `payload`: `any` – Data to sync
- `delayMs?`: `number` (optional) – Initial delay before first attempt

**Output (enqueue)**: `QueueItem`
```typescript
{
  id: string;
  payload: T;
  attempts: number;
  nextAttemptAt: number; // epoch ms
}
```

**Input (flush)**:
- `handler`: `(payload: T) => Promise<void>` – Async function to process each item

**Output (flush)**: `Promise<{ processed: number }>`

**Example Usage**:
```typescript
// Add report to sync queue
const queueReport = (reportData: any) => {
  enqueue(reportData, 0);
  console.log("Report queued for sync");
};

// Flush queue periodically
const syncQueue = async () => {
  const result = await flush(async (payload) => {
    await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  });
  console.log(`Synced ${result.processed} items`);
};

// Call syncQueue() every 30 seconds
setInterval(syncQueue, 30000);
```

---

### 6. `encrypt(data, key)` / `decrypt(blob, key)`

**Purpose**: Encrypt and decrypt sensitive data before storage/transmission.

**Input**:
- `data` / `blob`: `Uint8Array` – Binary data
- `key`: `Uint8Array` – Encryption key

**Output**: `Uint8Array` – Encrypted/decrypted binary data

**Example Usage**:
```typescript
// Convert string to bytes and encrypt
const encryptText = (text: string, keyBytes: Uint8Array): Uint8Array => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return encrypt(data, keyBytes);
};

// Decrypt and convert back to string
const decryptText = (blob: Uint8Array, keyBytes: Uint8Array): string => {
  const decrypted = decrypt(blob, keyBytes);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
```

---

## ⚠️ Critical Rules

### DO:
✅ Import functions from `"../core"`  
✅ Call functions with proper types  
✅ Handle async operations with try/catch  
✅ Display results in your UI  
✅ Ask owner if you need new core functionality  

### DON'T:
❌ Modify any file in `apps/client-app/core/`  
❌ Copy-paste core logic into `src/`  
❌ Implement business logic in UI components  
❌ Directly access ML models or services  
❌ Change function signatures or return types  

---

## 🌿 Git Workflow

**Your Branch**: `feature/module1-client`

```bash
# Work on your branch
git checkout feature/module1-client

# Make UI changes in src/ only
# Commit and push
git add apps/client-app/src/
git commit -m "feat(client): add audio recording UI"
git push origin feature/module1-client

# Create PR to dev branch (NOT main)
```

**Never commit**:
- Changes to `core/` folders
- Changes to `ml/`, `infra/`, `security/`

---

## 🆘 Getting Help

1. **Unclear function behavior?** → Check the function's JSDoc comments in core files
2. **Need new functionality?** → Ask the owner to add it to core
3. **Integration issues?** → Review `docs/examples/client_app_call_core.js`
4. **Architecture questions?** → Read `docs/ARCHITECTURE.md`

---

## 📚 Additional Resources

- `docs/ARCHITECTURE.md` – System architecture overview
- `docs/API_CONTRACT.md` – Complete function contracts
- `docs/TEAM_GUIDE.md` – Team workflow and branching
- `docs/examples/client_app_call_core.js` – Integration examples

---

**Remember**: You own the UI, the owner owns the logic. Keep it clean, keep it separate! 🎨
