# GramSense Architecture

## Core Principle

GramSense enforces a strict two-layer ownership model to guarantee clean separation of concerns, prevent merge conflicts, and enable parallel development:

| Layer | Folder Pattern | Owned By | Purpose |
|-------|----------------|----------|---------|
| src   | `*/src/`, `backend-api/routes/` | Juniors | UI, view/state, HTTP wrappers (THIN) |
| core  | `*/core/`, `services/`, `ml/`, `infra/`, `security/` | Owner | Business logic, data processing, ML, storage, crypto |

`src/` imports from `core/` – NEVER the reverse.

---

## Repository Structure (Simplified)

```
apps/
	client-app/
		src/      ← junior UI only
		core/     ← owner audio, VAD, NLU, storage, sync, crypto
	dashboard/
		src/      ← junior dashboard UI
		core/     ← owner transforms, aggregators, filters, pagination
	backend-api/
		routes/   ← junior FastAPI endpoint wrappers
		core/     ← owner ingestion, analytics, normalization, validation, geo, risk, summarization
		services/ ← owner db, orm, ml inference, utils
ml/           ← owner ASR, NLU, federated learning
infra/        ← owner deployment, CI/CD, storage infra
security/     ← owner encryption, hashing, signatures, audit ledger
docs/         ← architecture, usage, contracts, examples
```

---

## Data Flow Summary

### Client App (Module 1)
```
Mic → raw audio → src/UI component
					 │
					 ▼ import { processAudio } from "../core"
Audio normalized (core/audioProcessor)
					 │
					 ▼ detectVoiceActivity (core/vad)
Segments → transcription (future core ASR) → extractEntities (core/nlu)
					 │
					 ▼ saveOffline / enqueue (core/storage, core/syncQueue)
Background sync → backend API route → core ingestion → services DB
```

### Dashboard + Backend (Module 7)
```
Browser UI (src/) → fetch /api endpoints (routes/)
routes/ → call core (analytics, summary, geo, risk)
core → call services (db.query, ml.predict)
services → DB / ML assets → return enriched result
core → return JSON to routes → UI renders
UI uses core dashboard helpers (getChartData, paginate, applyFilters)
```

---

## Core vs Src Responsibilities

| Concern | src (UI / routes) | core / services |
|---------|-------------------|-----------------|
| Rendering | YES | NO |
| State (local/ui) | YES | NO |
| HTTP param parsing | YES (routes) | NO |
| Business logic | NO | YES |
| Validation / sanitization | NO (delegates) | YES |
| Data transforms | NO | YES |
| ML inference | NO | YES |
| Encryption | NO | YES |
| Persistence | NO | YES (services) |
| Retry / sync | NO | YES |

---

## Stable Interfaces (Examples)

### Client Core (TypeScript)
```ts
processAudio(input: PCMInput, sampleRateHint?: number): Promise<ProcessedAudio>
detectVoiceActivity(frames: Float32Array, sampleRate?: number): VADSegment[]
extractEntities(text: string): EntitiesMap
saveOffline<T>(key: string, value: T): Promise<OfflineRecord<T>>
loadOffline<T>(key: string): Promise<OfflineRecord<T> | null>
enqueue<T>(payload: T, delayMs?: number): QueueItem<T>
flush<T>(handler: (p: T) => Promise<void>): Promise<{ processed: number }>
encrypt(data: Uint8Array, key: Uint8Array): Uint8Array
decrypt(blob: Uint8Array, key: Uint8Array): Uint8Array
```

### Dashboard Core (TypeScript)
```ts
getChartData(records, timeKey?, valueKey?, groupKey?): ChartData
aggregateTimeSeries(points, windowMs): SeriesPoint[]
prepareClusterData(points, gridDeg?): Cluster[]
paginate<T>(items: T[], page: number, pageSize: number): Pagination<T>
applyFilters<T>(items: T[], filters: Filter[]): T[]
```

### Backend Core / Services (Python)
```py
process_report(payload: dict) -> dict
get_summary(params: dict | None) -> dict
normalize_entity(entity: dict) -> dict
sanitize_input(payload: dict) -> dict
compute_geo_stats(records: Iterable[dict], lat_key='lat', lng_key='lng') -> dict
summarize_text(text: str, max_sentences: int = 3) -> str
insert(row: dict) -> dict
query(where: dict | None) -> list[dict]
predict(features: dict) -> dict
now_ms() -> int
```

---

## Branching Strategy

| Branch | Purpose | Who |
|--------|---------|-----|
| `feature/owner-all-core` | All owner-only scaffolding & logic | Owner |
| `feature/module1-client` | Client app UI work | Module 1 dev |
| `feature/module7-dashboard-api` | Dashboard UI + API route wrappers | Module 7 dev |
| `dev` | Integration of feature branches | Shared |
| `main` | Stable releases | Shared (protected) |

Flow: `feature/*` → PR to `dev` → merge → release to `main`.

Owner MUST publish core scaffolding before juniors start: empty functions, types, placeholders.

---

## No-Conflict Guarantee

1. Physical separation: distinct folders per responsibility.
2. Unidirectional imports: UI never imported by logic.
3. Stable contracts: owner evolves internals without signature churn.
4. Branch isolation: juniors never push to owner branch.

---

## Example Route → Core → Service Chain
```py
@router.post('/reports')
async def create_report(payload: dict):
		clean = sanitize_input(payload)
		result = process_report(clean)
		insert(result['record'])
		return result
```

Dashboard consumption:
```ts
const raw = await fetch('/api/analytics/summary').then(r => r.json());
const chart = getChartData(raw.items, 'timestamp', 'value', 'region');
```

---

## Security & Privacy Layers

| Area | Folder | Purpose |
|------|--------|---------|
| Encryption | `security/privacy-layer/crypto.py` | Future AES-256-GCM (placeholder XOR) |
| Hashing | `security/privacy-layer/hash.py` | SHA-256 / SHA-512 digests |
| Signatures | `security/privacy-layer/signature.py` | HMAC-SHA256 signing / verification |
| Audit | `security/audit-ledger/ledger.py` | Hash-chained append-only ledger |

UI must NEVER implement or re-implement cryptography.

---

## ML Layer (Owner-Only)
| Model | Folder | Role |
|-------|--------|------|
| ASR Whisper | `ml/asr-engine/` | Speech-to-text |
| NLU / Entities | `ml/nlu-engine/` | Intent & entity extraction |
| Federated Client | `ml/federated-client/` | Local model updates |
| Federated Server | `ml/federated-server/` | Global aggregation |

Interfaces exposed to core only, never directly to UI.

---

## Deployment (High-Level)

| Layer | Artifact |
|-------|----------|
| Client & Dashboard | Built static bundles |
| Backend API | FastAPI app container |
| ML Services | Model runtime containers |
| Security | Shared library modules |

Environment-specific secrets live outside repository (in vault / env vars).

---

## Testing Strategy

| Test Type | Owner | Junior |
|-----------|-------|--------|
| Unit (core/services) | ✅ | ❌ |
| Unit (UI components) | ❌ | ✅ |
| Integration (routes → core) | ✅ | ✅ (thin routes) |
| E2E (UI → API) | Shared | Shared |

---

## Frequently Asked Questions

**Q: I need a new data transform – can I write it in `src/`?**  
No. Request owner to add it to `core/` and expose via barrel export.

**Q: Can I change a core function signature to fit my UI?**  
No. Wrap it in a small adapter inside `src/` if needed, but never alter core.

**Q: How do I store temporary UI state?**  
Use React state or local storage inside `src/`; use `saveOffline` only for cross-session persisted data.

---

## Next Planned Enhancements
1. Replace XOR crypto with AES-256-GCM.
2. Add real ASR pipeline integration.
3. Introduce schema-driven validation (Pydantic models in core, not routes).
4. Implement federated aggregation scheduler.

---

**Remember:** You own presentation (src, routes). Owner owns logic (core, services, ml, security). Keep it strictly separated.
