from __future__ import annotations
"""In-memory database utilities.

Owner-only placeholder persistence layer. Use insert/query helpers; do not
access internal _InMemoryDB state directly from routes.
"""
from typing import Any, Dict, List, Optional


class _InMemoryDB:
    """Append-only in-memory store.

    Notes:
        - Not thread-safe; single-process development only.
        - Replaceable with persistent adapter while preserving helper signatures.
    """

    def __init__(self) -> None:
        self._rows: List[Dict[str, Any]] = []

    def insert(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a row into store and return it."""
        self._rows.append(row)
        return row

    def query(
        self,
        where: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Return rows optionally filtered by equality dict and limited.

        Args:
            where: Dict of field=value pairs all of which must match.
            limit: If provided, tail slice maximum length.
        """
        rows: List[Dict[str, Any]] = self._rows
        if where:
            rows = [r for r in rows if all(r.get(k) == v for k, v in where.items())]
        if limit is not None:
            rows = rows[-limit:]
        return list(rows)


_db = _InMemoryDB()


def get_db() -> _InMemoryDB:
    """Return singleton DB handle."""
    return _db


def insert(row: Dict[str, Any]) -> Dict[str, Any]:
    """Public insert wrapper."""
    return _db.insert(row)


def query(where: Optional[Dict[str, Any]] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Public query wrapper mirroring _InMemoryDB.query."""
    return _db.query(where=where, limit=limit)
