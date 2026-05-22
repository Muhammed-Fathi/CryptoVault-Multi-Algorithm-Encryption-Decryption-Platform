/**
 * Cryptographic Algorithm Registry
 *
 * Central export point for all algorithms and their metadata.
 * This module provides a unified interface for the API service layer
 * to dispatch operations to the correct algorithm implementation.
 */

export {
  encryptVigenere,
  decryptVigenere,
  encryptVernam,
  decryptVernam,
  encryptPlayfair,
  decryptPlayfair,
} from './classical';

export {
  encryptRC4,
  decryptRC4,
  encryptDES,
  decryptDES,
  encryptAES,
  decryptAES,
  generateRSAKeyPair,
  encryptRSA,
  decryptRSA,
} from './modern';

export { hashMD5, hashSHA1, hashSHA256 } from './hashing';

import type { AlgorithmInfo } from '../types';

/** Complete registry of all supported algorithms with metadata */
export const ALGORITHMS: AlgorithmInfo[] = [
  // ── Classical ──────────────────────────────────────────────
  {
    id: 'vigenere',
    name: 'Vigenère Cipher',
    category: 'classical',
    description: 'Polyalphabetic substitution cipher using a keyword to shift letters with varying offsets.',
    keyRequirements: 'Any alphabetic keyword (letters only, A-Z)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Low',
    history:
      'Invented by Giovan Battista Bellaso in 1553 and later misattributed to Blaise de Vigenère. It was considered "le chiffre indéchiffrable" for 300 years until Charles Babbage and Friedrich Kasiski broke it in the 1860s.',
    howItWorks:
      'Uses a keyword to create multiple Caesar ciphers. Each plaintext letter is shifted by the corresponding key letter position. The key repeats cyclically across the message.',
    useCases: ['Educational purposes', 'Historical cryptography study', 'Puzzle games'],
  },
  {
    id: 'vernam',
    name: 'Vernam Cipher (OTP)',
    category: 'classical',
    description: 'One-Time Pad cipher where each plaintext byte is XORed with a random key byte.',
    keyRequirements: 'Key must be at least as long as the plaintext',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Very High',
    history:
      'Invented by Gilbert Vernam in 1917. Claude Shannon later proved that the one-time pad provides perfect secrecy when the key is truly random, used only once, and kept secret.',
    howItWorks:
      'Each byte of the plaintext is XORed with the corresponding byte of the key. Since XOR is its own inverse, the same operation decrypts. With a truly random key of equal length, it is information-theoretically secure.',
    useCases: ['Top-secret military communications', 'Diplomatic channels', 'High-security key exchange'],
  },
  {
    id: 'playfair',
    name: 'Playfair Cipher',
    category: 'classical',
    description: 'Digraph substitution cipher using a 5×5 key matrix to encrypt pairs of letters.',
    keyRequirements: 'Any alphabetic keyword (letters only, A-Z)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Low',
    history:
      'Invented by Charles Wheatstone in 1854 but named after Lord Playfair who promoted its use. It was the first practical digraph substitution cipher and was used by British forces in both World Wars.',
    howItWorks:
      'A 5×5 matrix is built from the keyword. Plaintext is split into digraphs. Three rules apply: same row → shift right, same column → shift down, rectangle → swap columns.',
    useCases: ['Historical military encryption', 'Educational cryptography', 'Code-breaking challenges'],
  },

  // ── Symmetric ──────────────────────────────────────────────
  {
    id: 'des',
    name: 'DES',
    category: 'symmetric',
    description: 'Data Encryption Standard — 56-bit key Feistel block cipher with 64-bit blocks.',
    keyRequirements: 'Minimum 8 characters (first 8 bytes used as key)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Low',
    history:
      'Developed by IBM in the 1970s based on Horst Feistel\'s Lucifer cipher. Adopted as a US federal standard in 1977. Now considered insecure due to the 56-bit key size — broken by brute force in 1998 by the EFF\'s Deep Crack machine.',
    howItWorks:
      '16-round Feistel network with Initial Permutation, expansion, S-box substitution, P-box permutation, and Final Permutation. Uses CBC mode with random IV for each encryption.',
    useCases: ['Legacy system compatibility', 'Educational study of block ciphers', 'Understanding Feistel architecture'],
  },
  {
    id: 'aes',
    name: 'AES',
    category: 'symmetric',
    description: 'Advanced Encryption Standard — 256-bit key Rijndael block cipher, the gold standard for symmetric encryption.',
    keyRequirements: 'Minimum 16 characters (key derived via SHA-256 to 256 bits)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Very High',
    history:
      'Designed by Vincent Rijmen and Joan Daemen. Selected by NIST in 2001 after a 5-year public competition. Now the most widely used symmetric cipher in the world, protecting everything from WiFi to government communications.',
    howItWorks:
      'Uses substitution-permutation networks with 10/12/14 rounds for 128/192/256-bit keys. Operates on 128-bit blocks. This implementation uses AES-256-CBC with PKCS7 padding via the Web Crypto API.',
    useCases: [
      'TLS/SSL encryption',
      'Disk encryption (BitLocker, FileVault)',
      'Database encryption',
      'Government classified data',
    ],
  },
  {
    id: 'rc4',
    name: 'RC4',
    category: 'symmetric',
    description: 'Rivest Cipher 4 — stream cipher using a variable-length key to generate a pseudorandom keystream.',
    keyRequirements: 'Any string (variable length key)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Low',
    history:
      'Designed by Ron Rivest in 1987. Kept as a trade secret until it was leaked in 1994. Once used in SSL/TLS, WEP, and many other protocols. Now considered broken due to statistical biases in its keystream.',
    howItWorks:
      'Key Scheduling Algorithm (KSA) initializes a 256-byte permutation state. Pseudo-Random Generation Algorithm (PRGA) produces a keystream byte by byte. The keystream is XORed with plaintext.',
    useCases: ['Legacy protocol support', 'Educational stream cipher study', 'Historical analysis'],
  },

  // ── Asymmetric ─────────────────────────────────────────────
  {
    id: 'rsa',
    name: 'RSA',
    category: 'asymmetric',
    description: 'Rivest–Shamir–Adleman — asymmetric public-key cryptosystem for encryption and key exchange.',
    keyRequirements: 'Keys are generated internally (2048 or 4096 bit)',
    isHashOnly: false,
    supportsEncrypt: true,
    supportsDecrypt: true,
    supportsHash: false,
    securityLevel: 'Very High',
    history:
      'Invented by Ron Rivest, Adi Shamir, and Leonard Adleman in 1977. One of the first public-key cryptosystems. Security relies on the practical difficulty of factoring the product of two large prime numbers.',
    howItWorks:
      'Generates a public/private key pair. Anyone can encrypt with the public key, but only the private key holder can decrypt. Uses RSA-OAEP padding with SHA-256 via the Web Crypto API for semantic security.',
    useCases: [
      'TLS/SSL certificate exchange',
      'Digital signatures',
      'Key exchange protocols',
      'Secure email (PGP)',
    ],
  },

  // ── Hashing ────────────────────────────────────────────────
  {
    id: 'md5',
    name: 'MD5',
    category: 'hashing',
    description: 'Message Digest Algorithm 5 — produces a 128-bit hash value. Cryptographically broken.',
    keyRequirements: 'No key required (hashing algorithm)',
    isHashOnly: true,
    supportsEncrypt: false,
    supportsDecrypt: false,
    supportsHash: true,
    securityLevel: 'Broken',
    history:
      'Designed by Ronald Rivest in 1991 as a replacement for MD4. Cryptographically broken since 2004 when collision attacks were demonstrated by Xiaoyun Wang. Still widely used for non-security purposes.',
    howItWorks:
      'Processes 512-bit blocks through 4 rounds of 16 operations each, using auxiliary functions F, G, H, I. Produces a 128-bit (16-byte) digest represented as a 32-character hexadecimal string.',
    useCases: ['File integrity verification', 'Checksums', 'Legacy system compatibility', 'Non-security hash lookups'],
  },
  {
    id: 'sha1',
    name: 'SHA-1',
    category: 'hashing',
    description: 'Secure Hash Algorithm 1 — produces a 160-bit hash. Deprecated for cryptographic use.',
    keyRequirements: 'No key required (hashing algorithm)',
    isHashOnly: true,
    supportsEncrypt: false,
    supportsDecrypt: false,
    supportsHash: true,
    securityLevel: 'Broken',
    history:
      'Designed by NSA and published by NIST in 1995. Google demonstrated a practical collision attack (SHAttered) in 2017. Deprecated by major browsers and certificate authorities.',
    howItWorks:
      'Processes 512-bit blocks through 80 rounds using Ch, Parity, and Maj functions with left rotation. Produces a 160-bit (20-byte) digest represented as a 40-character hexadecimal string.',
    useCases: [
      'Legacy git commit hashes',
      'File fingerprinting',
      'Older TLS certificate chains',
    ],
  },
  {
    id: 'sha256',
    name: 'SHA-256',
    category: 'hashing',
    description: 'Secure Hash Algorithm 256 — produces a 256-bit hash. Part of SHA-2 family, widely trusted.',
    keyRequirements: 'No key required (hashing algorithm)',
    isHashOnly: true,
    supportsEncrypt: false,
    supportsDecrypt: false,
    supportsHash: true,
    securityLevel: 'Very High',
    history:
      'Designed by NSA and published by NIST in 2001 as part of the SHA-2 family. Currently one of the most widely used hash functions. Forms the foundation of Bitcoin\'s proof-of-work algorithm.',
    howItWorks:
      'Processes 512-bit blocks through 64 rounds using Ch, Maj, Σ0, Σ1, σ0, σ1 functions with 64 pre-computed round constants. Produces a 256-bit (32-byte) digest represented as a 64-character hexadecimal string.',
    useCases: [
      'Blockchain technology (Bitcoin)',
      'TLS certificates',
      'Password hashing (with salt)',
      'Digital signatures',
    ],
  },
];

/** Get algorithm info by ID */
export function getAlgorithm(id: string): AlgorithmInfo | undefined {
  return ALGORITHMS.find((a) => a.id === id);
}

/** Get algorithms by category */
export function getAlgorithmsByCategory(category: string): AlgorithmInfo[] {
  return ALGORITHMS.filter((a) => a.category === category);
}
