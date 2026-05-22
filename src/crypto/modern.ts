/**
 * Modern Cryptographic Algorithms
 *
 * Implements RC4, DES (from scratch), AES (Web Crypto API), and RSA (Web Crypto API).
 *
 * - RC4: Stream cipher with KSA + PRGA (manual)
 * - DES: Block cipher with Feistel network (manual, full implementation)
 * - AES: Block cipher using Web Crypto API (SubtleCrypto)
 * - RSA: Asymmetric encryption using Web Crypto API (RSA-OAEP)
 */

// ══════════════════════════════════════════════════════════════
// RC4 STREAM CIPHER
// ══════════════════════════════════════════════════════════════

/**
 * RC4 Key Scheduling Algorithm (KSA)
 * Initializes the permutation state S-box from the key.
 */
function rc4KSA(key: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    [S[i], S[j]] = [S[j], S[i]];
  }
  return S;
}

/**
 * RC4 Pseudo-Random Generation Algorithm (PRGA)
 * Generates the keystream from the initialized S-box.
 */
function rc4PRGA(S: Uint8Array, length: number): Uint8Array {
  const state = new Uint8Array(S);
  const keystream = new Uint8Array(length);
  let i = 0,
    j = 0;
  for (let k = 0; k < length; k++) {
    i = (i + 1) & 0xff;
    j = (j + state[i]) & 0xff;
    [state[i], state[j]] = [state[j], state[i]];
    keystream[k] = state[(state[i] + state[j]) & 0xff];
  }
  return keystream;
}

export function encryptRC4(plaintext: string, key: string): string {
  if (!key) throw new Error('Key is required for RC4');
  const keyBytes = new TextEncoder().encode(key);
  const plainBytes = new TextEncoder().encode(plaintext);
  const S = rc4KSA(keyBytes);
  const keystream = rc4PRGA(S, plainBytes.length);
  const result = new Uint8Array(plainBytes.length);
  for (let i = 0; i < plainBytes.length; i++) result[i] = plainBytes[i] ^ keystream[i];
  return btoa(String.fromCharCode(...result));
}

export function decryptRC4(ciphertext: string, key: string): string {
  if (!key) throw new Error('Key is required for RC4');
  const cipherBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);
  const S = rc4KSA(keyBytes);
  const keystream = rc4PRGA(S, cipherBytes.length);
  const result = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) result[i] = cipherBytes[i] ^ keystream[i];
  return new TextDecoder().decode(result);
}

// ══════════════════════════════════════════════════════════════
// DES (DATA ENCRYPTION STANDARD)
// Full from-scratch implementation with CBC mode
// ══════════════════════════════════════════════════════════════

const DES_IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];

const DES_FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];

const DES_E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17,
  18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];

const DES_P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19,
  13, 30, 6, 22, 11, 4, 25,
];

const DES_SBOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 2, 0, 14, 9, 11],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

const DES_PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3,
  60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37,
  29, 21, 13, 5, 28, 20, 12, 4,
];

const DES_PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41,
  52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

const DES_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

/** Bit-level permutation */
function permute(input: number[], table: number[]): number[] {
  return table.map((pos) => input[pos - 1]);
}

/** XOR two bit arrays */
function xorBits(a: number[], b: number[]): number[] {
  return a.map((bit, i) => bit ^ b[i]);
}

/** Left-rotate a bit array */
function leftRotate(arr: number[], shifts: number): number[] {
  return [...arr.slice(shifts), ...arr.slice(0, shifts)];
}

/** Generate 16 round keys from the 64-bit key */
function generateDesRoundKeys(keyBits: number[]): number[][] {
  const pk = permute(keyBits, DES_PC1);
  let left = pk.slice(0, 28);
  let right = pk.slice(28, 56);
  const roundKeys: number[][] = [];
  for (let i = 0; i < 16; i++) {
    left = leftRotate(left, DES_SHIFTS[i]);
    right = leftRotate(right, DES_SHIFTS[i]);
    roundKeys.push(permute([...left, ...right], DES_PC2));
  }
  return roundKeys;
}

/** DES S-box lookup: 6 bits → 4 bits */
function sBoxLookup(boxIdx: number, bits: number[]): number {
  const row = (bits[0] << 1) | bits[5];
  const col = (bits[1] << 3) | (bits[2] << 2) | (bits[3] << 1) | bits[4];
  return DES_SBOXES[boxIdx][row][col];
}

/** DES Feistel function */
function desFeistel(right: number[], roundKey: number[]): number[] {
  const expanded = permute(right, DES_E);
  const xored = xorBits(expanded, roundKey);
  const sOut: number[] = [];
  for (let i = 0; i < 8; i++) {
    const val = sBoxLookup(i, xored.slice(i * 6, i * 6 + 6));
    for (let j = 3; j >= 0; j--) sOut.push((val >> j) & 1);
  }
  return permute(sOut, DES_P);
}

/** Process a single 64-bit DES block */
function desProcessBlock(block: number[], roundKeys: number[][]): number[] {
  const permuted = permute(block, DES_IP);
  let left = permuted.slice(0, 32);
  let right = permuted.slice(32, 64);
  for (let i = 0; i < 16; i++) {
    const newRight = xorBits(left, desFeistel(right, roundKeys[i]));
    left = right;
    right = newRight;
  }
  return permute([...right, ...left], DES_FP);
}

/** Convert byte array to bit array */
function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  return bits;
}

/** Convert bit array to byte array */
function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i * 8 + j];
    bytes[i] = byte;
  }
  return bytes;
}

/** PKCS7 padding */
function pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
  const pad = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + pad);
  padded.set(data);
  padded.fill(pad, data.length);
  return padded;
}

/** PKCS7 un-padding */
function pkcs7Unpad(data: Uint8Array): Uint8Array {
  const pad = data[data.length - 1];
  if (pad < 1 || pad > 8) throw new Error('Invalid PKCS7 padding');
  return data.slice(0, data.length - pad);
}

export function encryptDES(plaintext: string, key: string): string {
  if (!key) throw new Error('Key is required for DES');
  const keyBytes = new TextEncoder().encode(key);
  if (keyBytes.length < 8) throw new Error('DES key must be at least 8 characters');
  const plainBytes = pkcs7Pad(new TextEncoder().encode(plaintext), 8);
  const keyBits = bytesToBits(keyBytes.slice(0, 8));
  const roundKeys = generateDesRoundKeys(keyBits);

  const iv = new Uint8Array(8);
  crypto.getRandomValues(iv);
  let prevBlock = bytesToBits(iv);
  const encryptedBits: number[] = [];

  for (let i = 0; i < plainBytes.length; i += 8) {
    const blockBits = bytesToBits(plainBytes.slice(i, i + 8));
    const xored = xorBits(blockBits, prevBlock);
    const encrypted = desProcessBlock(xored, roundKeys);
    encryptedBits.push(...encrypted);
    prevBlock = encrypted;
  }

  const result = new Uint8Array([...iv, ...bitsToBytes(encryptedBits)]);
  return btoa(String.fromCharCode(...result));
}

export function decryptDES(ciphertext: string, key: string): string {
  if (!key) throw new Error('Key is required for DES');
  const allBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  if (allBytes.length < 16) throw new Error('Invalid DES ciphertext (too short)');

  const iv = allBytes.slice(0, 8);
  const cipherData = allBytes.slice(8);
  const keyBytes = new TextEncoder().encode(key);
  if (keyBytes.length < 8) throw new Error('DES key must be at least 8 characters');

  const keyBits = bytesToBits(keyBytes.slice(0, 8));
  const roundKeys = generateDesRoundKeys(keyBits).reverse();

  let prevBlock = bytesToBits(iv);
  const decryptedBits: number[] = [];

  for (let i = 0; i < cipherData.length; i += 8) {
    const blockBits = bytesToBits(cipherData.slice(i, i + 8));
    const decrypted = desProcessBlock(blockBits, roundKeys);
    const plainBits = xorBits(decrypted, prevBlock);
    decryptedBits.push(...plainBits);
    prevBlock = blockBits;
  }

  return new TextDecoder().decode(pkcs7Unpad(bitsToBytes(decryptedBits)));
}

// ══════════════════════════════════════════════════════════════
// AES (ADVANCED ENCRYPTION STANDARD) — Web Crypto API
// ══════════════════════════════════════════════════════════════

async function deriveAESKey(key: string): Promise<CryptoKey> {
  const keyBytes = new TextEncoder().encode(key);
  if (keyBytes.length < 16) throw new Error('AES key must be at least 16 characters');
  const hash = await crypto.subtle.digest('SHA-256', keyBytes);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptAES(plaintext: string, key: string): Promise<string> {
  const cryptoKey = await deriveAESKey(key);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptAES(ciphertext: string, key: string): Promise<string> {
  const cryptoKey = await deriveAESKey(key);
  const allBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  if (allBytes.length < 32) throw new Error('Invalid AES ciphertext');
  const iv = allBytes.slice(0, 16);
  const data = allBytes.slice(16);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}

// ══════════════════════════════════════════════════════════════
// RSA (RIVEST–SHAMIR–ADLEMAN) — Web Crypto API
// ══════════════════════════════════════════════════════════════

export async function generateRSAKeyPair(
  keySize: number = 2048
): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  const pubBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  return {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(pubBuf))),
    privateKey: btoa(String.fromCharCode(...new Uint8Array(privBuf))),
  };
}

export async function encryptRSA(plaintext: string, publicKeyB64: string): Promise<string> {
  const pubBuf = Uint8Array.from(atob(publicKeyB64), (c) => c.charCodeAt(0));
  const pubKey = await crypto.subtle.importKey(
    'spki',
    pubBuf,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    pubKey,
    new TextEncoder().encode(plaintext)
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptRSA(ciphertext: string, privateKeyB64: string): Promise<string> {
  const privBuf = Uint8Array.from(atob(privateKeyB64), (c) => c.charCodeAt(0));
  const privKey = await crypto.subtle.importKey(
    'pkcs8',
    privBuf,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privKey,
    Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  );
  return new TextDecoder().decode(decrypted);
}
