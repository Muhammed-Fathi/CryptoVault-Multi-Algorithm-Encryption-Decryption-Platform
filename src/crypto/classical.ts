/**
 * Classical Cryptographic Algorithms
 *
 * Implements Vigenère, Vernam (One-Time Pad), and Playfair ciphers
 * from scratch following their original mathematical principles.
 *
 * These algorithms are fundamental to the history of cryptography
 * and serve as educational foundations for modern encryption.
 */

// ──────────────────────────────────────────────────────────────
// VIGENÈRE CIPHER
// ──────────────────────────────────────────────────────────────

/**
 * Encrypts plaintext using the Vigenère cipher.
 *
 * A polyalphabetic substitution cipher using a keyword to shift
 * each letter by a different amount.
 *
 * Formula: Cᵢ = (Pᵢ + Kᵢ) mod 26
 *
 * @param plaintext - The text to encrypt
 * @param key - The encryption keyword
 * @returns The encrypted ciphertext
 */
export function encryptVigenere(plaintext: string, key: string): string {
  if (!key || key.length === 0) throw new Error('Key is required for Vigenère cipher');

  const normalizedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (normalizedKey.length === 0) throw new Error('Key must contain at least one letter (A-Z)');

  let keyIndex = 0;
  return plaintext
    .split('')
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const shift = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 65;
        keyIndex++;
        const shifted = ((char.charCodeAt(0) - base + shift) % 26) + base;
        return String.fromCharCode(shifted);
      }
      return char;
    })
    .join('');
}

/**
 * Decrypts ciphertext using the Vigenère cipher.
 *
 * Formula: Pᵢ = (Cᵢ - Kᵢ + 26) mod 26
 *
 * @param ciphertext - The text to decrypt
 * @param key - The decryption keyword (same as encryption key)
 * @returns The decrypted plaintext
 */
export function decryptVigenere(ciphertext: string, key: string): string {
  if (!key || key.length === 0) throw new Error('Key is required for Vigenère cipher');

  const normalizedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (normalizedKey.length === 0) throw new Error('Key must contain at least one letter (A-Z)');

  let keyIndex = 0;
  return ciphertext
    .split('')
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const shift = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 65;
        keyIndex++;
        const shifted = ((char.charCodeAt(0) - base - shift + 26) % 26) + base;
        return String.fromCharCode(shifted);
      }
      return char;
    })
    .join('');
}

// ──────────────────────────────────────────────────────────────
// VERNAM CIPHER (ONE-TIME PAD)
// ──────────────────────────────────────────────────────────────

/**
 * Encrypts plaintext using the Vernam (One-Time Pad) cipher.
 *
 * Each byte of plaintext is XORed with the corresponding byte of the key.
 * For perfect secrecy, the key must be truly random, used only once,
 * and at least as long as the plaintext.
 *
 * @param plaintext - The text to encrypt
 * @param key - The one-time pad key (must be ≥ plaintext length)
 * @returns Base64-encoded ciphertext
 */
export function encryptVernam(plaintext: string, key: string): string {
  if (!key || key.length === 0) throw new Error('Key is required for Vernam cipher');
  if (key.length < plaintext.length) {
    throw new Error(
      `Key length (${key.length}) must be at least as long as plaintext (${plaintext.length}) for Vernam cipher`
    );
  }

  const plainBytes = new TextEncoder().encode(plaintext);
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(plainBytes.length);

  for (let i = 0; i < plainBytes.length; i++) {
    result[i] = plainBytes[i] ^ keyBytes[i];
  }

  return btoa(String.fromCharCode(...result));
}

/**
 * Decrypts Vernam ciphertext using XOR (same operation as encryption).
 *
 * @param ciphertext - Base64-encoded ciphertext
 * @param key - The one-time pad key used for encryption
 * @returns The decrypted plaintext
 */
export function decryptVernam(ciphertext: string, key: string): string {
  if (!key || key.length === 0) throw new Error('Key is required for Vernam cipher');

  const cipherBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);

  if (keyBytes.length < cipherBytes.length) {
    throw new Error('Key is too short for the given ciphertext');
  }

  const result = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    result[i] = cipherBytes[i] ^ keyBytes[i];
  }

  return new TextDecoder().decode(result);
}

// ──────────────────────────────────────────────────────────────
// PLAYFAIR CIPHER
// ──────────────────────────────────────────────────────────────

/**
 * Playfair Cipher implementation.
 *
 * A digraph substitution cipher using a 5×5 key matrix.
 * The letter J is merged with I to fit the 25-cell grid.
 * Letters are encrypted in pairs using three rules:
 *   - Same row: shift right
 *   - Same column: shift down
 *   - Rectangle: swap columns
 */
export class PlayfairCipher {
  private matrix: string[][];

  constructor(key: string) {
    if (!key || key.length === 0) throw new Error('Key is required for Playfair cipher');
    this.matrix = this.buildMatrix(key.toUpperCase().replace(/[^A-Z]/g, ''));
  }

  /** Builds the 5×5 key matrix from keyword */
  private buildMatrix(key: string): string[][] {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // J merged with I
    const used = new Set<string>();
    const cells: string[] = [];

    for (const ch of key) {
      const c = ch === 'J' ? 'I' : ch;
      if (!used.has(c)) {
        used.add(c);
        cells.push(c);
      }
    }
    for (const ch of alphabet) {
      if (!used.has(ch)) {
        used.add(ch);
        cells.push(ch);
      }
    }

    const grid: string[][] = [];
    for (let r = 0; r < 5; r++) grid.push(cells.slice(r * 5, r * 5 + 5));
    return grid;
  }

  /** Finds the row and column of a letter in the matrix */
  private findPosition(char: string): [number, number] {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        if (this.matrix[r][c] === char) return [r, c];
    throw new Error(`Character '${char}' not found in Playfair matrix`);
  }

  /** Prepares text into digraphs, inserting X between duplicates */
  private prepareDigraphs(text: string): string[] {
    const normalized = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const pairs: string[] = [];
    let i = 0;
    while (i < normalized.length) {
      const a = normalized[i];
      const b = i + 1 < normalized.length ? normalized[i + 1] : 'X';
      if (a === b) {
        pairs.push(a + 'X');
        i++;
      } else {
        pairs.push(a + b);
        i += 2;
      }
    }
    return pairs;
  }

  /** Encrypts plaintext using the Playfair cipher */
  encrypt(plaintext: string): string {
    return this.prepareDigraphs(plaintext)
      .map(([a, b]) => {
        const [rA, cA] = this.findPosition(a);
        const [rB, cB] = this.findPosition(b);
        if (rA === rB) return this.matrix[rA][(cA + 1) % 5] + this.matrix[rB][(cB + 1) % 5];
        if (cA === cB) return this.matrix[(rA + 1) % 5][cA] + this.matrix[(rB + 1) % 5][cB];
        return this.matrix[rA][cB] + this.matrix[rB][cA];
      })
      .join(' ');
  }

  /** Decrypts ciphertext using the Playfair cipher */
  decrypt(ciphertext: string): string {
    return ciphertext
      .toUpperCase()
      .replace(/[^A-Z ]/g, '')
      .split(/\s+/)
      .filter((p) => p.length === 2)
      .map(([a, b]) => {
        const [rA, cA] = this.findPosition(a);
        const [rB, cB] = this.findPosition(b);
        if (rA === rB) return this.matrix[rA][(cA + 4) % 5] + this.matrix[rB][(cB + 4) % 5];
        if (cA === cB) return this.matrix[(rA + 4) % 5][cA] + this.matrix[(rB + 4) % 5][cB];
        return this.matrix[rA][cB] + this.matrix[rB][cA];
      })
      .join(' ');
  }
}

/** Convenience function to encrypt with Playfair */
export function encryptPlayfair(plaintext: string, key: string): string {
  return new PlayfairCipher(key).encrypt(plaintext);
}

/** Convenience function to decrypt with Playfair */
export function decryptPlayfair(ciphertext: string, key: string): string {
  return new PlayfairCipher(key).decrypt(ciphertext);
}
