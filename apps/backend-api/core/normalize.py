"""Normalization helpers for backend ingestion.

⚠️ DO NOT MODIFY THIS FILE - Owner-only code. Routes must call normalize_entity()
and avoid duplicating logic.
"""
from typing import Any, Dict


def normalize_entity(entity: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize common entity fields to a canonical form.

    Performs light canonicalization: trims string fields, lowercases emails,
    leaves other types unchanged. Future expansions may include phone parsing,
    country normalization, and schema validation without changing signature.

    Args:
        entity: Dictionary of raw entity attributes.

    Returns:
        Dictionary with normalized field values.

    Example:
        >>> raw = {"name": "  Alice ", "email": "Alice@Example.COM"}
        >>> normalize_entity(raw)
        {'name': 'Alice', 'email': 'alice@example.com'}

    Notes:
        - Owner-only logic. Junior route code must not re-implement normalization.
        - Safe for repeated calls (idempotent for trimmed fields).
    """
    out: Dict[str, Any] = {}
    for k, v in entity.items():
        if isinstance(v, str):
            out[k] = v.strip()
        else:
            out[k] = v
    if "email" in out and isinstance(out["email"], str):
        out["email"] = out["email"].lower()
    return out
