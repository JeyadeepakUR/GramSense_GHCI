"""Geospatial aggregation utilities.

⚠️ DO NOT MODIFY THIS FILE - Owner-only code. Routes should pass raw records
into compute_geo_stats() and avoid implementing spatial logic inline.
"""
from typing import Any, Dict, Iterable


def compute_geo_stats(records: Iterable[Dict[str, Any]], lat_key: str = "lat", lng_key: str = "lng") -> Dict[str, Any]:
    """Compute geospatial bounds and record count from an iterable of dicts.

    Iterates over provided records, extracting latitude/longitude fields, and
    maintains min/max bounds plus total valid point count.

    Args:
        records: Iterable of dictionaries containing lat/lng fields.
        lat_key: Field name for latitude values (default 'lat').
        lng_key: Field name for longitude values (default 'lng').

    Returns:
        Dict with one of:
            { "count": 0 }  # if no valid points
        OR
            {
              "count": int,
              "bounds": {
                "min_lat": float,
                "min_lng": float,
                "max_lat": float,
                "max_lng": float
              }
            }

    Example:
        >>> pts = [
        ...   {"lat": 10.0, "lng": 20.0},
        ...   {"lat": 12.5, "lng": 18.2},
        ... ]
        >>> compute_geo_stats(pts)
        {'count': 2, 'bounds': {'min_lat': 10.0, 'min_lng': 18.2, 'max_lat': 12.5, 'max_lng': 20.0}}

    Notes:
        - Invalid or missing coordinate records are skipped.
        - Owner-only logic; UI or routes must not replicate bounding calculations.
    """
    min_lat = min_lng = float("inf")
    max_lat = max_lng = float("-inf")
    count = 0
    for r in records:
        try:
            lat = float(r.get(lat_key))
            lng = float(r.get(lng_key))
        except Exception:
            continue
        min_lat = min(min_lat, lat)
        max_lat = max(max_lat, lat)
        min_lng = min(min_lng, lng)
        max_lng = max(max_lng, lng)
        count += 1
    if count == 0:
        return {"count": 0}
    return {"count": count, "bounds": {"min_lat": min_lat, "min_lng": min_lng, "max_lat": max_lat, "max_lng": max_lng}}
