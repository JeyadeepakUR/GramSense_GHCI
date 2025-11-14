"""
BACKEND API ROUTE WRAPPER EXAMPLE

This file demonstrates how junior developers working on Module 7 (Backend API)
should write route handlers that call core functions.

⚠️ This is a REFERENCE EXAMPLE ONLY - not part of the actual application.

Location: You work in apps/backend-api/routes/
You import from: apps.backend_api.core and apps.backend_api.services
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

# Import from owner-only core and services
from apps.backend_api.core import (
    process_report,
    get_summary,
    normalize_entity,
    sanitize_input,
    compute_geo_stats,
    calculate_risk,
    summarize_text,
)
from apps.backend_api.services import query, insert, predict

router = APIRouter()


# ============================================================================
# EXAMPLE 1: Simple Report Ingestion
# ============================================================================
#
# Routes should be THIN wrappers that:
# 1. Receive HTTP request
# 2. Extract/validate data
# 3. Call core function
# 4. Return HTTP response
#


@router.post("/reports")
async def create_report(payload: dict):
    """
    Endpoint to create a new report.
    Delegates ALL logic to core.process_report().
    
    This is the CORRECT pattern - thin wrapper only.
    """
    try:
        # Call core function (owner-implemented)
        result = process_report(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# EXAMPLE 2: Analytics Summary
# ============================================================================


@router.get("/analytics/summary")
async def fetch_summary(
    count: int = Query(default=0, description="Number of records"),
    mean: float = Query(default=0.0, description="Mean value"),
):
    """
    Get summary analytics.
    
    Route responsibility: Parse query params, call core, return JSON.
    Core responsibility: Compute actual analytics.
    """
    params = {"count": count, "mean": mean}
    
    # Call core function
    result = get_summary(params)
    return result


# ============================================================================
# EXAMPLE 3: Entity Normalization with Validation
# ============================================================================


class EntityInput(BaseModel):
    """Pydantic model for input validation (this IS your responsibility)."""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


@router.post("/entities/normalize")
async def normalize_entity_endpoint(entity: EntityInput):
    """
    Normalize entity data.
    
    Junior developer: Define input validation with Pydantic.
    Owner: Implements normalization logic in core.
    """
    # Convert Pydantic model to dict
    entity_dict = entity.dict()
    
    # Call core function
    normalized = normalize_entity(entity_dict)
    
    return {"status": "ok", "normalized": normalized}


# ============================================================================
# EXAMPLE 4: Input Sanitization
# ============================================================================


@router.post("/feedback")
async def submit_feedback(payload: dict):
    """
    Accept user feedback with sanitization.
    
    ALWAYS sanitize user input before storing.
    """
    # Sanitize using core function
    clean = sanitize_input(payload)
    
    # Store in database using services
    record = insert(clean)
    
    return {"status": "received", "id": record.get("id")}


# ============================================================================
# EXAMPLE 5: Geospatial Statistics
# ============================================================================


@router.get("/geo/stats")
async def geo_statistics():
    """
    Compute geospatial statistics from stored records.
    
    Route: Fetch data from DB, pass to core for computation.
    """
    # Fetch location records using services
    records = query({"has_location": True})
    
    # Compute stats using core function
    stats = compute_geo_stats(records, lat_key="latitude", lng_key="longitude")
    
    return stats


# ============================================================================
# EXAMPLE 6: Risk Assessment with ML
# ============================================================================


class RiskInput(BaseModel):
    severity: int
    location_risk: float
    time_since_last: int


@router.post("/risk/assess")
async def assess_risk(data: RiskInput):
    """
    Assess risk based on multiple factors.
    
    Combines core risk logic with ML predictions.
    """
    data_dict = data.dict()
    
    # Get ML prediction from services
    ml_score = predict(data_dict)
    
    # Combine with rule-based risk from core
    data_dict["ml_score"] = ml_score.get("score", 0.5)
    assessment = calculate_risk(data_dict)
    
    return assessment


# ============================================================================
# EXAMPLE 7: Text Summarization
# ============================================================================


class SummarizeRequest(BaseModel):
    text: str
    max_length: Optional[int] = 200


@router.post("/summarize")
async def create_summary(payload: SummarizeRequest):
    """
    Generate text summary.
    
    Route: Validate input, call core, return result.
    """
    summary = summarize_text(payload.text, max_length=payload.max_length)
    return {"status": "ok", "summary": summary}


# ============================================================================
# WRONG EXAMPLES (DON'T DO THESE)
# ============================================================================


@router.post("/reports/wrong")
async def create_report_WRONG(payload: dict):
    """
    ❌ WRONG: Business logic in route handler.
    
    This violates the architecture. ALL logic should be in core.
    """
    # ❌ DON'T do this - this is business logic
    record = dict(payload)
    record["_ingested"] = True
    record["timestamp"] = "2025-01-01"
    
    if record.get("priority") == "high":
        record["score"] = 100
    
    # ❌ Direct DB access without services
    # db.insert(record)
    
    return {"status": "ok", "record": record}


@router.get("/analytics/summary/wrong")
async def fetch_summary_WRONG():
    """
    ❌ WRONG: Computing analytics in route.
    
    This should be delegated to core.
    """
    # ❌ DON'T implement analytics logic here
    records = query({})
    total = len(records)
    mean_value = sum(r.get("value", 0) for r in records) / total if total else 0
    
    return {"total": total, "mean": mean_value}


# ============================================================================
# CORRECT PATTERN SUMMARY
# ============================================================================


"""
ROUTES SHOULD ONLY:
1. ✅ Define endpoints (@router.get, @router.post, etc.)
2. ✅ Validate input with Pydantic models
3. ✅ Parse query parameters
4. ✅ Call core functions
5. ✅ Call services functions (for DB/ML)
6. ✅ Format HTTP responses
7. ✅ Handle errors with try/except

ROUTES SHOULD NEVER:
1. ❌ Implement business logic
2. ❌ Do data processing or transformation
3. ❌ Perform calculations or analytics
4. ❌ Access database directly (use services)
5. ❌ Call ML models directly (use services)
6. ❌ Implement validation logic (use Pydantic + core)

REMEMBER:
- You own the API surface (HTTP layer)
- Owner owns the logic (core + services)
- Keep them separate!
"""


# ============================================================================
# TESTING YOUR ROUTES
# ============================================================================


"""
To test your routes locally:

1. Start the FastAPI server:
   uvicorn apps.backend_api.main:app --reload

2. Test with curl or httpie:
   curl -X POST http://localhost:8000/reports -H "Content-Type: application/json" -d '{"id": "123", "text": "Test"}'

3. View auto-generated docs:
   http://localhost:8000/docs

4. Routes should respond quickly (core does the work)
"""
