# Module 7: Dashboard + Backend API – Junior Developer Usage Guide

## 🎯 Your Responsibilities

You are working on **Module 7: Dashboard & Backend API**.

### ✅ What You CAN Touch

- **`apps/dashboard/src/`** – All dashboard UI components, charts, tables, React code
- **`apps/backend-api/routes/`** – API endpoint definitions ONLY (thin wrappers)

### ⛔ What You CANNOT Touch

- **`apps/dashboard/core/`** – Owner-only data transformation logic
- **`apps/backend-api/core/`** – Owner-only analytics, ingestion, validation logic
- **`apps/backend-api/services/`** – Owner-only database, ML, utilities
- **`ml/`** – Owner-only machine learning models
- **`infra/`** – Owner-only infrastructure
- **`security/`** – Owner-only security utilities

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────┐
│  apps/dashboard/src/  (YOUR UI CODE)          │
│  - React Components                           │
│  - Chart Displays                             │
│  - Filters & Pagination                       │
└──────────────┬────────────────────────────────┘
               │ imports from "../core"
               ▼
┌───────────────────────────────────────────────┐
│  apps/dashboard/core/  (OWNER-ONLY)           │
│  - Data Transformers                          │
│  - Time-Series Aggregators                    │
│  - Map/Cluster Preparation                    │
│  - Pagination & Filter Logic                  │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│  apps/backend-api/routes/  (YOUR API ROUTES)  │
│  - Endpoint Definitions                       │
│  - Request/Response Wrappers                  │
│  - THIN LAYER ONLY                            │
└──────────────┬────────────────────────────────┘
               │ imports from core/services
               ▼
┌───────────────────────────────────────────────┐
│  apps/backend-api/core/  (OWNER-ONLY)         │
│  - Ingestion Pipelines                        │
│  - Analytics Logic                            │
│  - Entity Normalization                       │
│  - Validation & Sanitization                  │
│  - Geospatial Processing                      │
│  - Risk Calculations                          │
│  - Summarization                              │
└──────────────┬────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────┐
│  apps/backend-api/services/  (OWNER-ONLY)     │
│  - Database Access                            │
│  - ORM Helpers                                │
│  - ML Inference Wrappers                      │
│  - Utility Functions                          │
└───────────────────────────────────────────────┘
```

**Flow**: Routes receive requests → call core functions → core calls services → return JSON

---

## 📦 Part 1: Dashboard Core Functions

Import from `"../core"` in your dashboard UI:

```typescript
import { 
  getChartData,
  aggregateTimeSeries,
  prepareClusterData,
  paginate,
  applyFilters
} from "../core";
```

### 1. `getChartData(records, timeKey?, valueKey?, groupKey?)`

**Purpose**: Transform raw data into chart-ready series grouped by a key.

**Input**:

- `records`: `Array<Record<string, any>>` – Raw data records
- `timeKey?`: `string` (default: "timestamp") – Field name for time/x-axis
- `valueKey?`: `string` (default: "value") – Field name for values/y-axis
- `groupKey?`: `string` (default: "series") – Field name for grouping series

**Output**: `ChartData`

```typescript
{
  series: Array<{
    id: string;              // Series identifier
    points: Array<{
      t: number;             // Time/x value
      v: number;             // Data value
    }>;
  }>;
  stats?: Record<string, number>; // Optional aggregated stats
}
```

**Example Usage**:

```typescript
// Fetch data from API
const rawData = await fetch("/api/metrics").then(r => r.json());

// Transform for charting
const chartData = getChartData(rawData, "timestamp", "count", "region");

// Pass to your chart library
<LineChart data={chartData.series} />
```

---

### 2. `aggregateTimeSeries(points, windowMs)`

**Purpose**: Reduce time-series data by averaging values within time windows.

**Input**:

- `points`: `SeriesPoint[]` – Array of `{ t: number, v: number }`
- `windowMs`: `number` – Time window size in milliseconds

**Output**: `SeriesPoint[]` – Aggregated points

**Example Usage**:

```typescript
// Get high-resolution data
const chartData = getChartData(records);

// Aggregate each series to hourly buckets
const aggregated = chartData.series.map(s => ({
  ...s,
  points: aggregateTimeSeries(s.points, 3600000) // 1 hour = 3600000ms
}));
```

---

### 3. `prepareClusterData(points, gridDeg?)`

**Purpose**: Group geographic points into clusters for map visualization.

**Input**:

- `points`: `LatLng[]` – Array of `{ lat: number, lng: number, value?: number }`
- `gridDeg?`: `number` (default: 0.1) – Grid cell size in degrees

**Output**: `Cluster[]`

```typescript
{
  lat: number;    // Cluster center latitude
  lng: number;    // Cluster center longitude
  count: number;  // Number of points in cluster
  sum?: number;   // Sum of values (if provided)
}[]
```

**Example Usage**:

```typescript
const locations = [
  { lat: 40.7128, lng: -74.0060, value: 10 },
  { lat: 40.7580, lng: -73.9855, value: 15 },
  // ...
];

const clusters = prepareClusterData(locations, 0.05);

// Render on map
clusters.forEach(c => {
  addMarker({ lat: c.lat, lng: c.lng, size: c.count });
});
```

---

### 4. `paginate(items, page, pageSize)`

**Purpose**: Paginate an array of items.

**Input**:

- `items`: `T[]` – Array to paginate
- `page`: `number` – Current page number (1-indexed)
- `pageSize`: `number` – Items per page

**Output**: `Pagination<T>`

```typescript
{
  items: T[];        // Items for current page
  total: number;     // Total number of items
  page: number;      // Current page
  pageSize: number;  // Page size
}
```

**Example Usage**:

```typescript
const allReports = await fetchReports();
const paginatedData = paginate(allReports, currentPage, 20);

<Table data={paginatedData.items} />
<Pagination 
  current={paginatedData.page} 
  total={paginatedData.total} 
  pageSize={paginatedData.pageSize}
/>
```

---

### 5. `applyFilters(items, filters)`

**Purpose**: Filter an array based on multiple conditions.

**Input**:

- `items`: `T[]` – Array to filter
- `filters`: `Filter[]` – Array of filter conditions

**Filter Structure**:

```typescript
{
  field: string;  // Field name to filter on
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: any;     // Value to compare against
}
```

**Output**: `T[]` – Filtered array

**Example Usage**:

```typescript
const filters = [
  { field: "status", op: "eq", value: "active" },
  { field: "score", op: "gte", value: 70 },
  { field: "region", op: "in", value: ["US", "CA", "MX"] }
];

const filtered = applyFilters(allRecords, filters);
```

---

## 📦 Part 2: Backend API Core Functions

Import from `apps.backend_api.core` in your route files:

```python
from apps.backend_api.core import (
    process_report,
    get_summary,
    normalize_entity,
    sanitize_input,
    compute_geo_stats,
    calculate_risk,
    summarize_text
)
```

### 1. `process_report(payload: Dict) -> Dict`

**Purpose**: Ingest and normalize an incoming report.

**Input**: `Dict[str, Any]` – Raw report payload

**Output**:

```python
{
    "status": "ok",
    "id": str,          # Report ID
    "record": dict      # Normalized record
}
```

**Example Route**:

```python
from fastapi import APIRouter
from apps.backend_api.core import process_report

router = APIRouter()

@router.post("/reports")
async def create_report(payload: dict):
    result = process_report(payload)
    return result
```

---

### 2. `get_summary(params: Dict | None) -> Dict`

**Purpose**: Compute aggregate summary metrics.

**Input**: `Dict[str, Any] | None` – Optional parameters

**Output**:

```python
{
    "status": "ok",
    "summary": {
        "records": int,
        "mean": float,
        "min": float,
        "max": float
    }
}
```

**Example Route**:

```python
@router.get("/analytics/summary")
async def fetch_summary(count: int = 0, mean: float = 0.0):
    params = {"count": count, "mean": mean}
    result = get_summary(params)
    return result
```

---

### 3. `normalize_entity(entity: Dict) -> Dict`

**Purpose**: Normalize entity fields to canonical format.

**Input**: `Dict[str, Any]` – Raw entity data

**Output**: `Dict[str, Any]` – Normalized entity

**Example Route**:

```python
@router.post("/entities/normalize")
async def normalize(entity: dict):
    normalized = normalize_entity(entity)
    return {"normalized": normalized}
```

---

### 4. `sanitize_input(payload: Dict) -> Dict`

**Purpose**: Sanitize user input to prevent injection attacks.

**Input**: `Dict[str, Any]` – Raw user input

**Output**: `Dict[str, Any]` – Sanitized data

**Example Route**:

```python
@router.post("/feedback")
async def submit_feedback(payload: dict):
    clean = sanitize_input(payload)
    # Store clean data safely
    return {"status": "received", "data": clean}
```

---

### 5. `compute_geo_stats(records: Iterable[Dict], lat_key?, lng_key?) -> Dict`

**Purpose**: Compute geospatial bounds and count from records.

**Input**:

- `records`: Iterable of dictionaries with lat/lng fields
- `lat_key?`: `str` (default: "lat")
- `lng_key?`: `str` (default: "lng")

**Output**:

```python
{
    "count": int,
    "bounds": {
        "min_lat": float,
        "min_lng": float,
        "max_lat": float,
        "max_lng": float
    }
}
```

**Example Route**:

```python
@router.get("/geo/stats")
async def geo_statistics():
    records = fetch_location_records()  # Your DB query
    stats = compute_geo_stats(records)
    return stats
```

---

### 6. `calculate_risk(data: Dict) -> Dict`

**Purpose**: Calculate risk score based on input parameters.

**Input**: `Dict[str, Any]` – Risk parameters

**Output**: `Dict[str, Any]` – Risk assessment

**Example Route**:

```python
@router.post("/risk/assess")
async def assess_risk(data: dict):
    assessment = calculate_risk(data)
    return assessment
```

---

### 7. `summarize_text(text: str, max_length?) -> str`

**Purpose**: Generate a text summary.

**Input**:

- `text`: `str` – Text to summarize
- `max_length?`: `int` (optional)

**Output**: `str` – Summarized text

**Example Route**:

```python
@router.post("/summarize")
async def create_summary(payload: dict):
    text = payload.get("text", "")
    summary = summarize_text(text, max_length=200)
    return {"summary": summary}
```

---

## ⚠️ Critical Rules for Backend Routes

### DO:

✅ **Keep routes THIN** – Only handle HTTP concerns (request parsing, response formatting)  
✅ **Import from core** – Always call `core` or `services` functions  
✅ **Return JSON** – Use FastAPI's automatic serialization  
✅ **Validate inputs** – Use Pydantic models for request validation  
✅ **Handle errors** – Wrap core calls in try/except if needed  

### DON'T:

❌ **Put logic in routes** – NO business logic, calculations, or data processing  
❌ **Modify core files** – Never change `apps/backend-api/core/*.py`  
❌ **Modify services** – Never change `apps/backend-api/services/*.py`  
❌ **Direct DB access** – Always go through services layer  
❌ **Inline ML code** – ML lives in `ml/` and is accessed via services  

---

## 📝 Route Template Pattern

**Correct Pattern** (thin wrapper):

```python
from fastapi import APIRouter, HTTPException
from apps.backend_api.core import process_report

router = APIRouter()

@router.post("/reports")
async def create_report(payload: dict):
    """
    Endpoint to create a new report.
    Delegates all logic to core.process_report().
    """
    try:
        result = process_report(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Wrong Pattern** (logic in route):

```python
# ❌ DON'T DO THIS
@router.post("/reports")
async def create_report(payload: dict):
    # This is business logic - belongs in core!
    record = dict(payload)
    record["_ingested"] = True
    record["timestamp"] = datetime.now()
    # ... more processing ...
    return {"status": "ok", "record": record}
```

---

## 🌿 Git Workflow

**Your Branch**: `feature/module7-dashboard-api`

```bash
# Work on your branch
git checkout feature/module7-dashboard-api

# Make changes in src/ and routes/ only
git add apps/dashboard/src/
git add apps/backend-api/routes/
git commit -m "feat(dashboard): add metrics visualization"
git push origin feature/module7-dashboard-api

# Create PR to dev branch (NOT main)
```

**Never commit**:

- Changes to `core/` folders
- Changes to `services/` folders
- Changes to `ml/`, `infra/`, `security/`

---

## 🆘 Getting Help

1. **Unclear core function?** → Check docstrings in core files
2. **Need new endpoint logic?** → Ask owner to add it to core
3. **Integration issues?** → Review `docs/examples/`
4. **Architecture questions?** → Read `docs/ARCHITECTURE.md`

---

## 📚 Additional Resources

- `docs/ARCHITECTURE.md` – System architecture overview
- `docs/API_CONTRACT.md` – Complete API contracts
- `docs/TEAM_GUIDE.md` – Team workflow and branching
- `docs/examples/dashboard_call_core.js` – Dashboard examples
- `docs/examples/backend_route_wrapper_example.py` – Backend examples

---

**Remember**: You own the presentation layer (UI + routes), the owner owns the logic (core + services). Keep them separate! 🎨
