"""Input sanitation utilities for backend routes.

⚠️ DO NOT MODIFY THIS FILE - Owner-only code. Routes should call sanitize_input()
before persistence. Real validation will layer on top of this using schemas.
"""
from typing import Any, Dict


def sanitize_input(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Perform minimal sanitation of incoming payload strings.

    Strips trivial injection tokens and reserved characters. This is NOT a full
    security solution—final implementation will employ structured validation
    (Pydantic models + strict field whitelisting).

    Args:
        payload: Raw dictionary received from HTTP route.

    Returns:
        New dictionary with sanitized string fields; non-string values pass through.

    Example:
        >>> sanitize_input({'name': 'Bob;--', 'comment': '$DROP TABLE'})
        {'name': 'Bob', 'comment': 'DROP TABLE'}

    Notes:
        - Owner-only logic.
        - Does NOT guarantee SQL/NoSQL injection prevention; DB layer must still
          use parameterized queries.
    """
    cleaned: Dict[str, Any] = {}
    for k, v in payload.items():
        if isinstance(v, str):
            cleaned[k] = v.replace("$", "").replace(";", "").replace("--", "")
        else:
            cleaned[k] = v
    return cleaned
