from __future__ import annotations
"""ORM-like dataclass utilities (owner-only).

Provides stable Record abstraction so higher layers avoid manual dict
construction. Routes should create Record and call to_row() for persistence.
"""
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class Record:
    """Simple record container.

    Args:
        id: Unique identifier string.
        payload: Arbitrary key/value mapping for the record body.
    """
    id: str
    payload: Dict[str, Any]

    def to_row(self) -> Dict[str, Any]:
        """Return flattened dict for database insertion.

        Merges id field into payload while preserving payload precedence in
        case of key collision (id key is forced).
        """
        return {"id": self.id, **self.payload}
