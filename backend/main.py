"""
CryptoVault Backend — FastAPI Application
==========================================
Multi-Algorithm Encryption & Decryption Platform

All cryptographic algorithms are implemented in this single module
for deployment simplicity. In a production system, these would be
split into separate packages following domain-driven design.

Architecture:
    FastAPI Backend (this file)
         /           \
        /             \
   Streamlit App   React Frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import base64
import struct
import math
import random
import os

# ══════════════════════════════════════════════════════════════
#  CLASSICAL CIPHERS
# ══════════════════════════════════════════════════════════════


def vigenere_encrypt(plaintext: str, key: str) -> str:
    """Encrypt using the Vigenère cipher. Cᵢ = (Pᵢ + Kᵢ) mod 26."""
    norm_key = "".join(c for c in key.upper() if c.isalpha())
    if not norm_key:
        raise ValueError("Key must contain at least one letter (A-Z)")
    result, ki = [], 0
    for ch in plaintext:
        if ch.isalpha():
            base = 65 if ch.isupper() else 97
            shift = ord(norm_key[ki % len(norm_key)]) - 65
            ki += 1
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)


def vigenere_decrypt(ciphertext: str, key: str) -> str:
    """Decrypt Vigenère cipher. Pᵢ = (Cᵢ - Kᵢ + 26) mod 26."""
    norm_key = "".join(c for c in key.upper() if c.isalpha())
    if not norm_key:
        raise ValueError("Key must contain at least one letter (A-Z)")
    result, ki = [], 0
    for ch in ciphertext:
        if ch.isalpha():
            base = 65 if ch.isupper() else 97
            shift = ord(norm_key[ki % len(norm_key)]) - 65
            ki += 1
            result.append(chr((ord(ch) - base - shift + 26) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)


def vernam_encrypt(plaintext: str, key: str) -> str:
    """XOR-based One-Time Pad. Key must be ≥ plaintext length."""
    if len(key) < len(plaintext):
        raise ValueError(f"Key length ({len(key)}) must be ≥ plaintext length ({len(plaintext)})")
    pb, kb = plaintext.encode(), key.encode()
    return base64.b64encode(bytes(a ^ b for a, b in zip(pb, kb))).decode()


def vernam_decrypt(ciphertext: str, key: str) -> str:
    """Decrypt Vernam (XOR is its own inverse)."""
    cb = base64.b64decode(ciphertext)
    kb = key.encode()
    if len(kb) < len(cb):
        raise ValueError("Key too short for ciphertext")
    return bytes(a ^ b for a, b in zip(cb, kb)).decode()


def _playfair_matrix(key: str) -> list[list[str]]:
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    used, cells = set(), []
    for ch in key.upper():
        c = "I" if ch == "J" else ch
        if c.isalpha() and c not in used:
            used.add(c)
            cells.append(c)
    for ch in alphabet:
        if ch not in used:
            cells.append(ch)
    return [cells[i * 5 : (i + 1) * 5] for i in range(5)]


def _pf_find(matrix: list[list[str]], char: str) -> tuple[int, int]:
    for r, row in enumerate(matrix):
        for c, v in enumerate(row):
            if v == char:
                return r, c
    raise ValueError(f"Char '{char}' not in matrix")


def playfair_encrypt(plaintext: str, key: str) -> str:
    """Encrypt using the Playfair digraph cipher."""
    if not key.strip():
        raise ValueError("Key is required for Playfair cipher")
    matrix = _playfair_matrix(key)
    norm = plaintext.upper().replace("J", "I")
    norm = "".join(c for c in norm if c.isalpha())
    pairs, i = [], 0
    while i < len(norm):
        a = norm[i]
        b = norm[i + 1] if i + 1 < len(norm) else "X"
        if a == b:
            pairs.append((a, "X"))
            i += 1
        else:
            pairs.append((a, b))
            i += 2
    result = []
    for a, b in pairs:
        ra, ca = _pf_find(matrix, a)
        rb, cb = _pf_find(matrix, b)
        if ra == rb:
            result.append(matrix[ra][(ca + 1) % 5] + matrix[rb][(cb + 1) % 5])
        elif ca == cb:
            result.append(matrix[(ra + 1) % 5][ca] + matrix[(rb + 1) % 5][cb])
        else:
            result.append(matrix[ra][cb] + matrix[rb][ca])
    return " ".join(result)


def playfair_decrypt(ciphertext: str, key: str) -> str:
    """Decrypt Playfair cipher."""
    if not key.strip():
        raise ValueError("Key is required for Playfair cipher")
    matrix = _playfair_matrix(key)
    result = []
    for pair in ciphertext.upper().split():
        if len(pair) != 2:
            continue
        a, b = pair
        ra, ca = _pf_find(matrix, a)
        rb, cb = _pf_find(matrix, b)
        if ra == rb:
            result.append(matrix[ra][(ca - 1) % 5] + matrix[rb][(cb - 1) % 5])
        elif ca == cb:
            result.append(matrix[(ra - 1) % 5][ca] + matrix[(rb - 1) % 5][cb])
        else:
            result.append(matrix[ra][cb] + matrix[rb][ca])
    return " ".join(result)


# ══════════════════════════════════════════════════════════════
#  RC4 — FROM SCRATCH
# ══════════════════════════════════════════════════════════════


def _rc4_ksa(key: bytes) -> list[int]:
    """Key Scheduling Algorithm."""
    S = list(range(256))
    j = 0
    for i in range(256):
        j = (j + S[i] + key[i % len(key)]) & 0xFF
        S[i], S[j] = S[j], S[i]
    return S


def _rc4_prga(S: list[int], length: int) -> bytes:
    """Pseudo-Random Generation Algorithm."""
    state = S[:]
    i = j = 0
    out = bytearray(length)
    for k in range(length):
        i = (i + 1) & 0xFF
        j = (j + state[i]) & 0xFF
        state[i], state[j] = state[j], state[i]
        out[k] = state[(state[i] + state[j]) & 0xFF]
    return bytes(out)


def rc4_encrypt(plaintext: str, key: str) -> str:
    pb = plaintext.encode()
    ks = _rc4_prga(_rc4_ksa(key.encode()), len(pb))
    return base64.b64encode(bytes(a ^ b for a, b in zip(pb, ks))).decode()


def rc4_decrypt(ciphertext: str, key: str) -> str:
    cb = base64.b64decode(ciphertext)
    ks = _rc4_prga(_rc4_ksa(key.encode()), len(cb))
    return bytes(a ^ b for a, b in zip(cb, ks)).decode()


# ══════════════════════════════════════════════════════════════
#  RSA — FROM SCRATCH
# ══════════════════════════════════════════════════════════════


def _is_prime(n: int, k: int = 5) -> bool:
    """Miller-Rabin primality test."""
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0:
        return False
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def _generate_prime(bits: int) -> int:
    """Generate a random prime of the given bit size."""
    while True:
        n = random.getrandbits(bits) | (1 << (bits - 1)) | 1
        if _is_prime(n, k=7):
            return n


def _extended_gcd(a: int, b: int) -> tuple[int, int, int]:
    if a == 0:
        return b, 0, 1
    g, x1, y1 = _extended_gcd(b % a, a)
    return g, y1 - (b // a) * x1, x1


def _mod_inverse(e: int, phi: int) -> int:
    g, x, _ = _extended_gcd(e % phi, phi)
    if g != 1:
        raise ValueError("Modular inverse does not exist")
    return x % phi


def rsa_generate_keys(key_size: int = 2048) -> dict:
    """Generate RSA public/private key pair from scratch."""
    prime_bits = key_size // 2
    p = _generate_prime(prime_bits)
    q = _generate_prime(prime_bits)
    while p == q:
        q = _generate_prime(prime_bits)
    n = p * q
    phi = (p - 1) * (q - 1)
    e = 65537
    while math.gcd(e, phi) != 1:
        e += 2
    d = _mod_inverse(e, phi)
    return {
        "public_key": base64.b64encode(f"{n}:{e}".encode()).decode(),
        "private_key": base64.b64encode(f"{n}:{d}".encode()).decode(),
        "key_size": key_size,
    }


def _parse_rsa_key(key_b64: str) -> tuple[int, int]:
    raw = base64.b64decode(key_b64).decode()
    parts = raw.split(":")
    return int(parts[0]), int(parts[1])


def rsa_encrypt(plaintext: str, public_key_b64: str) -> str:
    """RSA encrypt using textbook RSA (no OAEP for from-scratch clarity)."""
    n, e = _parse_rsa_key(public_key_b64)
    m = int.from_bytes(plaintext.encode(), "big")
    if m >= n:
        raise ValueError("Message too long for RSA key size")
    c = pow(m, e, n)
    byte_len = (n.bit_length() + 7) // 8
    return base64.b64encode(c.to_bytes(byte_len, "big")).decode()


def rsa_decrypt(ciphertext: str, private_key_b64: str) -> str:
    """RSA decrypt."""
    n, d = _parse_rsa_key(private_key_b64)
    cb = base64.b64decode(ciphertext)
    c = int.from_bytes(cb, "big")
    m = pow(c, d, n)
    byte_len = (m.bit_length() + 7) // 8
    return m.to_bytes(byte_len, "big").decode()


# ══════════════════════════════════════════════════════════════
#  DES & AES — USING PyCryptodome
# ══════════════════════════════════════════════════════════════

try:
    from Crypto.Cipher import DES as DESMod, AES as AESMod
    from Crypto.Util.Padding import pad, unpad

    def des_encrypt(plaintext: str, key: str) -> str:
        kb = key.encode()[:8].ljust(8, b"\0")
        iv = os.urandom(8)
        cipher = DESMod.new(kb, DESMod.MODE_CBC, iv)
        padded = pad(plaintext.encode(), 8)
        ct = cipher.encrypt(padded)
        return base64.b64encode(iv + ct).decode()

    def des_decrypt(ciphertext: str, key: str) -> str:
        raw = base64.b64decode(ciphertext)
        iv, ct = raw[:8], raw[8:]
        kb = key.encode()[:8].ljust(8, b"\0")
        cipher = DESMod.new(kb, DESMod.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), 8).decode()

    def aes_encrypt(plaintext: str, key: str) -> str:
        import hashlib as _hl

        kb = _hl.sha256(key.encode()).digest()
        iv = os.urandom(16)
        cipher = AESMod.new(kb, AESMod.MODE_CBC, iv)
        padded = pad(plaintext.encode(), 16)
        ct = cipher.encrypt(padded)
        return base64.b64encode(iv + ct).decode()

    def aes_decrypt(ciphertext: str, key: str) -> str:
        import hashlib as _hl

        raw = base64.b64decode(ciphertext)
        iv, ct = raw[:16], raw[16:]
        kb = _hl.sha256(key.encode()).digest()
        cipher = AESMod.new(kb, AESMod.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), 16).decode()

except ImportError:
    # Fallback: simple XOR-based stubs when PyCryptodome not installed
    def des_encrypt(plaintext: str, key: str) -> str:
        kb = (key * 8)[:8].encode()
        return base64.b64encode(bytes(a ^ kb[i % 8] for i, a in enumerate(plaintext.encode()))).decode()

    def des_decrypt(ciphertext: str, key: str) -> str:
        kb = (key * 8)[:8].encode()
        return bytes(a ^ kb[i % 8] for i, a in enumerate(base64.b64decode(ciphertext))).decode()

    def aes_encrypt(plaintext: str, key: str) -> str:
        return des_encrypt(plaintext, key)

    def aes_decrypt(ciphertext: str, key: str) -> str:
        return des_decrypt(ciphertext, key)


# ══════════════════════════════════════════════════════════════
#  HASHING ALGORITHMS — FROM SCRATCH
# ══════════════════════════════════════════════════════════════

_LEFT = lambda x, n: ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF
_RIGHT = lambda x, n: ((x >> n) | (x << (32 - n))) & 0xFFFFFFFF


def _md5(message: str) -> str:
    """MD5 (RFC 1321) — 128-bit digest, from scratch."""
    msg = message.encode()
    bit_len = len(msg) * 8
    pad_len = len(msg) + 1
    while pad_len % 64 != 56:
        pad_len += 1
    padded = bytearray(pad_len + 8)
    padded[: len(msg)] = msg
    padded[len(msg)] = 0x80
    struct.pack_into("<Q", padded, pad_len, bit_len)

    a0, b0, c0, d0 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476
    S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    ]
    K = [int(abs(math.sin(i + 1)) * (2**32)) & 0xFFFFFFFF for i in range(64)]

    for off in range(0, len(padded), 64):
        M = [struct.unpack_from("<I", padded, off + i * 4)[0] for i in range(16)]
        A, B, C, D = a0, b0, c0, d0
        for i in range(64):
            if i < 16:
                F = (B & C) | (~B & D)
                g = i
            elif i < 32:
                F = (D & B) | (~D & C)
                g = (5 * i + 1) % 16
            elif i < 48:
                F = B ^ C ^ D
                g = (3 * i + 5) % 16
            else:
                F = C ^ (B | ~D)
                g = (7 * i) % 16
            F = (F + A + K[i] + M[g]) & 0xFFFFFFFF
            A, D, C = D, C, B
            B = (B + _LEFT(F, S[i])) & 0xFFFFFFFF
        a0, b0, c0, d0 = (a0 + A) & 0xFFFFFFFF, (b0 + B) & 0xFFFFFFFF, (c0 + C) & 0xFFFFFFFF, (d0 + D) & 0xFFFFFFFF

    return struct.pack("<4I", a0, b0, c0, d0).hex()


def _sha1(message: str) -> str:
    """SHA-1 (FIPS 180-4) — 160-bit digest, from scratch."""
    msg = message.encode()
    bit_len = len(msg) * 8
    pad_len = len(msg) + 1
    while pad_len % 64 != 56:
        pad_len += 1
    padded = bytearray(pad_len + 8)
    padded[: len(msg)] = msg
    padded[len(msg)] = 0x80
    struct.pack_into(">Q", padded, pad_len, bit_len)

    h0, h1, h2, h3, h4 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0

    for off in range(0, len(padded), 64):
        w = [struct.unpack_from(">I", padded, off + i * 4)[0] for i in range(16)]
        for i in range(16, 80):
            w.append(_LEFT(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1))
        a, b, c, d, e = h0, h1, h2, h3, h4
        for i in range(80):
            if i < 20:
                f, k = (b & c) | (~b & d), 0x5A827999
            elif i < 40:
                f, k = b ^ c ^ d, 0x6ED9EBA1
            elif i < 60:
                f, k = (b & c) | (b & d) | (c & d), 0x8F1BBCDC
            else:
                f, k = b ^ c ^ d, 0xCA62C1D6
            temp = (_LEFT(a, 5) + f + e + k + w[i]) & 0xFFFFFFFF
            e, d, c, b, a = d, c, _LEFT(b, 30), a, temp
        h0, h1, h2, h3, h4 = (h0 + a) & 0xFFFFFFFF, (h1 + b) & 0xFFFFFFFF, (h2 + c) & 0xFFFFFFFF, (h3 + d) & 0xFFFFFFFF, (h4 + e) & 0xFFFFFFFF

    return struct.pack(">5I", h0, h1, h2, h3, h4).hex()


def _sha256(message: str) -> str:
    """SHA-256 (FIPS 180-4) — 256-bit digest, from scratch."""
    K256 = [
        0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
        0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
        0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
        0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
        0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
        0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
        0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
        0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2,
    ]
    msg = message.encode()
    bit_len = len(msg) * 8
    pad_len = len(msg) + 1
    while pad_len % 64 != 56:
        pad_len += 1
    padded = bytearray(pad_len + 8)
    padded[: len(msg)] = msg
    padded[len(msg)] = 0x80
    struct.pack_into(">Q", padded, pad_len, bit_len)

    h = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]

    for off in range(0, len(padded), 64):
        w = [struct.unpack_from(">I", padded, off + i * 4)[0] for i in range(16)]
        for i in range(16, 64):
            s0 = _RIGHT(w[i - 15], 7) ^ _RIGHT(w[i - 15], 18) ^ (w[i - 15] >> 3)
            s1 = _RIGHT(w[i - 2], 17) ^ _RIGHT(w[i - 2], 19) ^ (w[i - 2] >> 10)
            w.append((w[i - 16] + s0 + w[i - 7] + s1) & 0xFFFFFFFF)
        a, b, c, d, e, f, g, hh = h
        for i in range(64):
            S1 = _RIGHT(e, 6) ^ _RIGHT(e, 11) ^ _RIGHT(e, 25)
            ch = (e & f) ^ (~e & g)
            temp1 = (hh + S1 + ch + K256[i] + w[i]) & 0xFFFFFFFF
            S0 = _RIGHT(a, 2) ^ _RIGHT(a, 13) ^ _RIGHT(a, 22)
            maj = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (S0 + maj) & 0xFFFFFFFF
            hh, g, f, e, d, c, b, a = g, f, e, (d + temp1) & 0xFFFFFFFF, c, b, a, (temp1 + temp2) & 0xFFFFFFFF
        for i in range(8):
            h[i] = (h[i] + [a, b, c, d, e, f, g, hh][i]) & 0xFFFFFFFF

    return struct.pack(">8I", *h).hex()


# ══════════════════════════════════════════════════════════════
#  DISPATCH TABLES
# ══════════════════════════════════════════════════════════════

ENCRYPT_MAP = {
    "vigenere": vigenere_encrypt,
    "vernan": vernam_encrypt,
    "playfair": playfair_encrypt,
    "rc4": rc4_encrypt,
    "des": des_encrypt,
    "aes": aes_encrypt,
    "rsa": rsa_encrypt,
}

DECRYPT_MAP = {
    "vigenere": vigenere_decrypt,
    "vernan": vernam_decrypt,
    "playfair": playfair_decrypt,
    "rc4": rc4_decrypt,
    "des": des_decrypt,
    "aes": aes_decrypt,
    "rsa": rsa_decrypt,
}

HASH_MAP = {
    "md5": _md5,
    "sha1": _sha1,
    "sha256": _sha256,
}

ALGORITHMS_META = [
    {"id": a["id"], "name": a["name"], "category": a["category"],
     "supports_encrypt": a["supports_encrypt"], "supports_decrypt": a["supports_decrypt"],
     "supports_hash": a["supports_hash"], "is_hash_only": a["is_hash_only"]}
    for a in [
        {"id": "vigenere", "name": "Vigenère Cipher", "category": "classical", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "vernan", "name": "Vernam Cipher (OTP)", "category": "classical", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "playfair", "name": "Playfair Cipher", "category": "classical", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "des", "name": "DES", "category": "symmetric", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "aes", "name": "AES", "category": "symmetric", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "rc4", "name": "RC4", "category": "symmetric", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "rsa", "name": "RSA", "category": "asymmetric", "supports_encrypt": True, "supports_decrypt": True, "supports_hash": False, "is_hash_only": False},
        {"id": "md5", "name": "MD5", "category": "hashing", "supports_encrypt": False, "supports_decrypt": False, "supports_hash": True, "is_hash_only": True},
        {"id": "sha1", "name": "SHA-1", "category": "hashing", "supports_encrypt": False, "supports_decrypt": False, "supports_hash": True, "is_hash_only": True},
        {"id": "sha256", "name": "SHA-256", "category": "hashing", "supports_encrypt": False, "supports_decrypt": False, "supports_hash": True, "is_hash_only": True},
    ]
]


# ══════════════════════════════════════════════════════════════
#  PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════


class EncryptRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to encrypt")
    algorithm: str = Field(..., description="Algorithm identifier")
    key: Optional[str] = Field(None, description="Secret key")


class DecryptRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Ciphertext to decrypt")
    algorithm: str = Field(..., description="Algorithm identifier")
    key: Optional[str] = Field(None, description="Secret key")


class HashRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to hash")
    algorithm: str = Field(..., description="Hash algorithm identifier")


class RSAKeyRequest(BaseModel):
    key_size: int = Field(default=2048, ge=512, le=4096, description="Key size in bits")


# ══════════════════════════════════════════════════════════════
#  FASTAPI APPLICATION
# ══════════════════════════════════════════════════════════════

app = FastAPI(
    title="CryptoVault API",
    description="Multi-Algorithm Encryption & Decryption Platform — REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/algorithms")
async def list_algorithms():
    """List all supported cryptographic algorithms."""
    return {"algorithms": ALGORITHMS_META}


@app.post("/encrypt")
async def encrypt(req: EncryptRequest):
    """Encrypt text using the specified algorithm."""
    fn = ENCRYPT_MAP.get(req.algorithm)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm: {req.algorithm}")
    try:
        result = fn(req.text, req.key or "")
        return {"success": True, "result": result, "algorithm": req.algorithm, "operation": "encrypt"}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/decrypt")
async def decrypt(req: DecryptRequest):
    """Decrypt ciphertext using the specified algorithm."""
    fn = DECRYPT_MAP.get(req.algorithm)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm: {req.algorithm}")
    try:
        result = fn(req.text, req.key or "")
        return {"success": True, "result": result, "algorithm": req.algorithm, "operation": "decrypt"}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/hash")
async def hash_text(req: HashRequest):
    """Generate a cryptographic hash."""
    fn = HASH_MAP.get(req.algorithm)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Unknown hash algorithm: {req.algorithm}")
    try:
        result = fn(req.text)
        return {"success": True, "hash": result, "algorithm": req.algorithm}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/generate-rsa-keys")
async def generate_rsa_keys(req: RSAKeyRequest):
    """Generate an RSA public/private key pair."""
    try:
        keys = rsa_generate_keys(req.key_size)
        return {"success": True, **keys}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
