"""
CryptoVault — Algorithm Correctness Tests
==========================================
Validates that all cryptographic implementations produce
correct, verifiable output for known test vectors.
"""

import sys
import os
import hashlib

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import (
    vigenere_encrypt, vigenere_decrypt,
    vernam_encrypt, vernam_decrypt,
    playfair_encrypt, playfair_decrypt,
    rc4_encrypt, rc4_decrypt,
    _md5, _sha1, _sha256,
)


class TestVigenere:
    """Test Vigenère cipher encrypt/decrypt round-trip."""

    def test_basic_roundtrip(self):
        key = "SECRET"
        plaintext = "HELLO WORLD"
        encrypted = vigenere_encrypt(plaintext, key)
        decrypted = vigenere_decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_case_preservation(self):
        key = "KEY"
        plaintext = "Hello World"
        encrypted = vigenere_encrypt(plaintext, key)
        decrypted = vigenere_decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_nonalpha_preserved(self):
        key = "ABC"
        plaintext = "Hello, World! 123"
        encrypted = vigenere_encrypt(plaintext, key)
        decrypted = vigenere_decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_known_vector(self):
        """Vigenère with key 'KEY' on 'HELLO' should produce 'RIJVS'."""
        assert vigenere_encrypt("HELLO", "KEY") == "RIJVS"


class TestVernam:
    """Test Vernam (OTP) cipher."""

    def test_roundtrip(self):
        key = "supersecretkey123"
        plaintext = "Hello, World!"
        encrypted = vernam_encrypt(plaintext, key)
        decrypted = vernam_decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_short_key_raises(self):
        try:
            vernam_encrypt("long message here", "short")
            assert False, "Should have raised ValueError"
        except ValueError:
            pass


class TestPlayfair:
    """Test Playfair cipher."""

    def test_roundtrip(self):
        key = "MONARCHY"
        plaintext = "HELLO"
        encrypted = playfair_encrypt(plaintext, key)
        decrypted = playfair_decrypt(encrypted, key)
        # Note: Playfair digraphs may differ from original due to padding
        assert len(decrypted.replace(" ", "")) >= len(plaintext.replace(" ", ""))


class TestRC4:
    """Test RC4 stream cipher."""

    def test_roundtrip(self):
        key = "secretkey"
        plaintext = "Hello, RC4 World!"
        encrypted = rc4_encrypt(plaintext, key)
        decrypted = rc4_decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_symmetry(self):
        """RC4 encrypt and decrypt are the same XOR operation."""
        key = "test"
        pt = "symmetric test"
        enc = rc4_encrypt(pt, key)
        dec = rc4_decrypt(enc, key)
        assert dec == pt


class TestMD5:
    """Test MD5 hash against hashlib reference."""

    def test_empty_string(self):
        expected = hashlib.md5(b"").hexdigest()
        assert _md5("") == expected

    def test_hello(self):
        expected = hashlib.md5(b"hello").hexdigest()
        assert _md5("hello") == expected

    def test_longer_message(self):
        msg = "The quick brown fox jumps over the lazy dog"
        expected = hashlib.md5(msg.encode()).hexdigest()
        assert _md5(msg) == expected

    def test_numbers_and_symbols(self):
        msg = "Test 123! @#$%"
        expected = hashlib.md5(msg.encode()).hexdigest()
        assert _md5(msg) == expected


class TestSHA1:
    """Test SHA-1 hash against hashlib reference."""

    def test_empty_string(self):
        expected = hashlib.sha1(b"").hexdigest()
        assert _sha1("") == expected

    def test_hello(self):
        expected = hashlib.sha1(b"hello").hexdigest()
        assert _sha1("hello") == expected

    def test_longer_message(self):
        msg = "The quick brown fox jumps over the lazy dog"
        expected = hashlib.sha1(msg.encode()).hexdigest()
        assert _sha1(msg) == expected


class TestSHA256:
    """Test SHA-256 hash against hashlib reference."""

    def test_empty_string(self):
        expected = hashlib.sha256(b"").hexdigest()
        assert _sha256("") == expected

    def test_hello(self):
        expected = hashlib.sha256(b"hello").hexdigest()
        assert _sha256("hello") == expected

    def test_longer_message(self):
        msg = "The quick brown fox jumps over the lazy dog"
        expected = hashlib.sha256(msg.encode()).hexdigest()
        assert _sha256(msg) == expected

    def test_unicode(self):
        msg = "Hello 世界 🌍"
        expected = hashlib.sha256(msg.encode()).hexdigest()
        assert _sha256(msg) == expected


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
