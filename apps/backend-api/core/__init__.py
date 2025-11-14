"""Owner-only backend core package.

Stable interfaces for ingestion, analytics, normalization, validation,
geospatial, risk and summarization.
"""

from .ingest import process_report
from .analytics import get_summary
from .normalize import normalize_entity
from .validation import sanitize_input
from .geospatial import compute_geo_stats
from .summarize import summarize_text
from .risk import calculate_risk

__all__ = [
    "process_report",
    "get_summary",
    "normalize_entity",
    "sanitize_input",
    "compute_geo_stats",
    "summarize_text",
    "calculate_risk",
]
