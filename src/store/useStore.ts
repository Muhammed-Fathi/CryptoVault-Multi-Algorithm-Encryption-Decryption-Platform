/**
 * Zustand State Store
 *
 * Central state management for the CryptoVault platform.
 * Manages algorithm selection, inputs, results, history,
 * notifications, and RSA key state.
 */

import { create } from 'zustand';
import type { HistoryEntry, Notification } from '../types';

interface AppState {
  // ── Connection ──
  apiConnected: boolean;
  setApiConnected: (v: boolean) => void;

  // ── Algorithm ──
  selectedAlgorithm: string;
  setSelectedAlgorithm: (id: string) => void;

  // ── Inputs ──
  plaintext: string;
  setPlaintext: (t: string) => void;
  secretKey: string;
  setSecretKey: (k: string) => void;
  ciphertext: string;
  setCiphertext: (t: string) => void;

  // ── Result ──
  result: string;
  setResult: (r: string) => void;

  // ── Loading ──
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // ── History ──
  history: HistoryEntry[];
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  // ── Notifications ──
  notifications: Notification[];
  pushNotification: (type: Notification['type'], message: string) => void;
  dismissNotification: (id: string) => void;

  // ── RSA ──
  rsaPublicKey: string;
  rsaPrivateKey: string;
  setRsaPublicKey: (k: string) => void;
  setRsaPrivateKey: (k: string) => void;

  // ── Reset ──
  resetForm: () => void;
}

export const useStore = create<AppState>((set) => ({
  apiConnected: false,
  setApiConnected: (v) => set({ apiConnected: v }),

  selectedAlgorithm: 'aes',
  setSelectedAlgorithm: (id) => set({ selectedAlgorithm: id }),

  plaintext: '',
  setPlaintext: (t) => set({ plaintext: t }),
  secretKey: '',
  setSecretKey: (k) => set({ secretKey: k }),
  ciphertext: '',
  setCiphertext: (t) => set({ ciphertext: t }),

  result: '',
  setResult: (r) => set({ result: r }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  history: [],
  addHistory: (entry) =>
    set((s) => ({
      history: [
        { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
        ...s.history,
      ].slice(0, 50),
    })),
  clearHistory: () => set({ history: [] }),

  notifications: [],
  pushNotification: (type, message) => {
    const id = crypto.randomUUID();
    set((s) => ({
      notifications: [...s.notifications, { id, type, message, timestamp: Date.now() }],
    }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 4000);
  },
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  rsaPublicKey: '',
  rsaPrivateKey: '',
  setRsaPublicKey: (k) => set({ rsaPublicKey: k }),
  setRsaPrivateKey: (k) => set({ rsaPrivateKey: k }),

  resetForm: () =>
    set({ plaintext: '', secretKey: '', ciphertext: '', result: '' }),
}));
