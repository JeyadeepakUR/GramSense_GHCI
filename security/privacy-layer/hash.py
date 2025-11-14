import hashlib
from typing import ByteString


def sha256(data: ByteString) -> str:
    return hashlib.sha256(bytes(data)).hexdigest()


def sha512(data: ByteString) -> str:
    return hashlib.sha512(bytes(data)).hexdigest()
