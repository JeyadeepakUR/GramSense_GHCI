"""Utility helpers (owner-only)."""
import time


def now_ms() -> int:
    """Return current epoch milliseconds.

    Thin wrapper used for timestamp injection to centralize time source and
    allow future mocking or monotonic adjustments.
    """
    return int(time.time() * 1000)
