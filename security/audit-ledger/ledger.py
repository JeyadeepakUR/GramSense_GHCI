"""Minimal append-only audit ledger helpers (hash-chained)."""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional
import time
import hashlib


@dataclass
class Entry:
    ts: int
    actor: str
    action: str
    prev_hash: str
    hash: str


def _hash(ts: int, actor: str, action: str, prev_hash: str) -> str:
    h = hashlib.sha256()
    h.update(str(ts).encode())
    h.update(actor.encode())
    h.update(action.encode())
    h.update(prev_hash.encode())
    return h.hexdigest()


def append_entry(entries: List[Entry], actor: str, action: str) -> Entry:
    ts = int(time.time() * 1000)
    prev = entries[-1].hash if entries else "genesis"
    digest = _hash(ts, actor, action, prev)
    e = Entry(ts=ts, actor=actor, action=action, prev_hash=prev, hash=digest)
    entries.append(e)
    return e


def verify_chain(entries: List[Entry]) -> bool:
    prev = "genesis"
    for e in entries:
        if e.prev_hash != prev:
            return False
        if e.hash != _hash(e.ts, e.actor, e.action, e.prev_hash):
            return False
        prev = e.hash
    return True
