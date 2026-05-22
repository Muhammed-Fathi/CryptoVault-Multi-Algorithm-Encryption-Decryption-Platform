/**
 * Type definitions for the CryptoVault Platform
 * Central type registry for all shared interfaces
 */

export type AlgorithmCategory = 'classical' | 'symmetric' | 'asymmetric' | 'hashing';

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  keyRequirements: string;
  isHashOnly: boolean;
  supportsEncrypt: boolean;
  supportsDecrypt: boolean;
  supportsHash: boolean;
  securityLevel: string;
  history: string;
  howItWorks: string;
  useCases: string[];
}

export interface CryptoRequest {
  text: string;
  algorithm: string;
  key?: string;
}

export interface CryptoResponse {
  result: string;
  algorithm: string;
  operation: string;
  success: boolean;
  error?: string;
}

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
  keySize: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  algorithm: string;
  operation: string;
  inputPreview: string;
  outputPreview: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}
