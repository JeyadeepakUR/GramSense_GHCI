import hmac
import hashlib
from typing import ByteString


def sign_hmac_sha256(data: ByteString, key: ByteString) -> str:
    return hmac.new(bytes(key), bytes(data), hashlib.sha256).hexdigest()


def verify_hmac_sha256(data: ByteString, key: ByteString, signature_hex: str) -> bool:
    expected = sign_hmac_sha256(data, key)
    return hmac.compare_digest(expected, signature_hex)
