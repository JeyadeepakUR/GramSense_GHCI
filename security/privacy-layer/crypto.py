"""Privacy-layer crypto helpers.

NOTE: AES-256 requires external libraries; this module exposes stable interfaces
encrypt_bytes/decrypt_bytes with a temporary XOR-based placeholder so callers
can integrate safely. Replace with a proper AES-256 implementation later.
"""
from typing import ByteString


def encrypt_bytes(data: ByteString, key: ByteString) -> bytes:
    db = bytes(data)
    kb = bytes(key)
    return bytes((db[i] ^ kb[i % len(kb)]) for i in range(len(db)))


def decrypt_bytes(blob: ByteString, key: ByteString) -> bytes:
    # XOR is symmetric
    return encrypt_bytes(blob, key)
