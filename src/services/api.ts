/**
 * API Service Layer
 *
 * Provides a unified interface for cryptographic operations.
 * Attempts to communicate with the FastAPI backend first.
 * Falls back to client-side implementations when the backend
 * is unavailable (offline/demo mode).
 */

import axios from 'axios';
import {
  encryptVigenere,
  decryptVigenere,
  encryptVernam,
  decryptVernam,
  encryptPlayfair,
  decryptPlayfair,
  encryptRC4,
  decryptRC4,
  encryptDES,
  decryptDES,
  encryptAES,
  decryptAES,
  encryptRSA,
  decryptRSA,
  hashMD5,
  hashSHA1,
  hashSHA256,
} from '../crypto';

const API_BASE = 'http://localhost:8000';
const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

let _apiConnected = false;

/** Check if the FastAPI backend is reachable */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await api.get('/health');
    _apiConnected = res.status === 200;
    return _apiConnected;
  } catch {
    _apiConnected = false;
    return false;
  }
}

/** Whether we're currently connected to the API */
export function isApiConnected(): boolean {
  return _apiConnected;
}

// ── Encrypt ──────────────────────────────────────────────────

export async function encryptText(
  text: string,
  algorithm: string,
  key: string
): Promise<string> {
  if (_apiConnected) {
    try {
      const res = await api.post('/encrypt', { text, algorithm, key });
      if (res.data.success) return res.data.result;
    } catch {
      /* fall through to local */
    }
  }
  return localEncrypt(text, algorithm, key);
}

async function localEncrypt(text: string, algorithm: string, key: string): Promise<string> {
  switch (algorithm) {
    case 'vigenere':
      return encryptVigenere(text, key);
    case 'vernan':
      return encryptVernam(text, key);
    case 'playfair':
      return encryptPlayfair(text, key);
    case 'rc4':
      return encryptRC4(text, key);
    case 'des':
      return encryptDES(text, key);
    case 'aes':
      return encryptAES(text, key);
    case 'rsa':
      if (!key) throw new Error('RSA encryption requires the public key in the key field');
      return encryptRSA(text, key);
    default:
      throw new Error(`Unknown encryption algorithm: ${algorithm}`);
  }
}

// ── Decrypt ──────────────────────────────────────────────────

export async function decryptText(
  text: string,
  algorithm: string,
  key: string
): Promise<string> {
  if (_apiConnected) {
    try {
      const res = await api.post('/decrypt', { text, algorithm, key });
      if (res.data.success) return res.data.result;
    } catch {
      /* fall through to local */
    }
  }
  return localDecrypt(text, algorithm, key);
}

async function localDecrypt(text: string, algorithm: string, key: string): Promise<string> {
  switch (algorithm) {
    case 'vigenere':
      return decryptVigenere(text, key);
    case 'vernan':
      return decryptVernam(text, key);
    case 'playfair':
      return decryptPlayfair(text, key);
    case 'rc4':
      return decryptRC4(text, key);
    case 'des':
      return decryptDES(text, key);
    case 'aes':
      return decryptAES(text, key);
    case 'rsa':
      if (!key) throw new Error('RSA decryption requires the private key in the key field');
      return decryptRSA(text, key);
    default:
      throw new Error(`Unknown decryption algorithm: ${algorithm}`);
  }
}

// ── Hash ─────────────────────────────────────────────────────

export async function hashText(
  text: string,
  algorithm: string
): Promise<string> {
  if (_apiConnected) {
    try {
      const res = await api.post('/hash', { text, algorithm });
      if (res.data.success) return res.data.hash ?? res.data.result;
    } catch {
      /* fall through to local */
    }
  }
  return localHash(text, algorithm);
}

function localHash(text: string, algorithm: string): string {
  switch (algorithm) {
    case 'md5':
      return hashMD5(text);
    case 'sha1':
      return hashSHA1(text);
    case 'sha256':
      return hashSHA256(text);
    default:
      throw new Error(`Unknown hash algorithm: ${algorithm}`);
  }
}

// ── RSA Key Generation ───────────────────────────────────────

export async function generateRSAKeys(
  keySize: number = 2048
): Promise<{ publicKey: string; privateKey: string }> {
  if (_apiConnected) {
    try {
      const res = await api.post('/generate-rsa-keys', { key_size: keySize });
      if (res.data.success) return { publicKey: res.data.public_key, privateKey: res.data.private_key };
    } catch {
      /* fall through to local */
    }
  }
  const { generateRSAKeyPair } = await import('../crypto/modern');
  return generateRSAKeyPair(keySize);
}

// ── Algorithm list ───────────────────────────────────────────

export async function fetchAlgorithms(): Promise<unknown[]> {
  if (_apiConnected) {
    try {
      const res = await api.get('/algorithms');
      if (res.data) return res.data;
    } catch {
      /* fall through */
    }
  }
  const { ALGORITHMS } = await import('../crypto/index');
  return ALGORITHMS;
}
