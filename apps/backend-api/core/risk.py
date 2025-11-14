"""Risk scoring utilities.

⚠️ Owner-only module. Routes must call calculate_risk() instead of re-implementing
scoring logic. This placeholder keeps a stable interface for future upgrades
(e.g., ML model integration or rules engine).
"""
from typing import Any, Dict, Iterable


def calculate_risk(events: Iterable[Dict[str, Any]], severity_key: str = "severity", amount_key: str = "amount") -> Dict[str, Any]:
    """Compute an aggregate risk score from a sequence of event dicts.

    Each event contributes additive risk based on severity category and a
    scaled amount feature. The resulting total is normalized into a 0..1
    score and mapped to a qualitative band. This interface is intentionally
    simple; internal logic can evolve without breaking callers.

    Args:
        events: Iterable of event dictionaries.
        severity_key: Field name for severity classification.
        amount_key: Field name for numeric amount.

    Returns:
        Dictionary containing:
            score (float): Normalized aggregate risk 0..1.
            band (str): 'low' | 'medium' | 'high'.
            count (int): Number of events contributing.

    Example:
        >>> evs = [
        ...   {"severity": "high", "amount": 5000},
        ...   {"severity": "low", "amount": 25000},
        ... ]
        >>> calculate_risk(evs)
        {'score': 0.75, 'band': 'medium', 'count': 2}

    Notes:
        - Severity scaling is placeholder (high/critical => +0.5, medium => +0.25).
        - Amount contributes up to +0.5 per event based on amount/10000 capped at 0.5.
        - Final normalization caps at 1.0; band thresholds may be tuned later.
    """
    raw_total = 0.0
    count = 0
    for e in events:
        sev = str(e.get(severity_key, "")).lower()
        if sev in ("high", "critical"):
            raw_total += 0.5
        elif sev in ("medium",):
            raw_total += 0.25
        amt = e.get(amount_key)
        try:
            raw_total += min(0.5, float(amt) / 10000.0)
        except Exception:
            pass
        count += 1
    # Normalize assuming worst-case ~1 per event then cap to 1.0
    if count > 0:
        score = min(1.0, raw_total / count)
    else:
        score = 0.0
    if score < 0.33:
        band = "low"
    elif score < 0.66:
        band = "medium"
    else:
        band = "high"
    return {"score": score, "band": band, "count": count}
