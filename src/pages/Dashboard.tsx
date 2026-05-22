import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Unlock, Hash, Trash2, Copy, Download, Eye, EyeOff,
  Shield, AlertCircle, KeyRound, Clock, Loader2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ALGORITHMS, getAlgorithm } from '../crypto';
import { encryptText, decryptText, hashText } from '../services/api';

function catColor(cat: string) {
  const m: Record<string, string> = {
    classical: 'bg-amber-500/15 text-amber-400',
    symmetric: 'bg-blue-500/15 text-blue-400',
    asymmetric: 'bg-purple-500/15 text-purple-400',
    hashing: 'bg-emerald-500/15 text-emerald-400',
  };
  return m[cat] ?? 'bg-slate-500/15 text-slate-400';
}

function secColor(lvl: string) {
  const m: Record<string, string> = {
    Broken: 'bg-red-500/15 text-red-400',
    Low: 'bg-amber-500/15 text-amber-400',
    Medium: 'bg-yellow-500/15 text-yellow-400',
    High: 'bg-cyan-500/15 text-cyan-400',
    'Very High': 'bg-emerald-500/15 text-emerald-400',
  };
  return m[lvl] ?? 'bg-slate-500/15 text-slate-400';
}

function opColor(op: string) {
  const m: Record<string, string> = { encrypt: 'text-cyan-400', decrypt: 'text-purple-400', hash: 'text-emerald-400' };
  return m[op] ?? 'text-slate-400';
}

export default function Dashboard() {
  const {
    selectedAlgorithm, setSelectedAlgorithm,
    plaintext, setPlaintext,
    secretKey, setSecretKey,
    result, setResult,
    isLoading, setIsLoading,
    history, addHistory, clearHistory,
    pushNotification, resetForm,
  } = useStore();

  const [showKey, setShowKey] = useState(false);
  const algo = getAlgorithm(selectedAlgorithm);

  const doOp = useCallback(async (op: 'encrypt' | 'decrypt' | 'hash') => {
    const src = op === 'decrypt' ? plaintext : plaintext;
    if (!src.trim()) { pushNotification('warning', 'Please enter text'); return; }
    if (op !== 'hash' && !algo?.isHashOnly && selectedAlgorithm !== 'rsa' && !secretKey.trim()) {
      pushNotification('warning', 'Please enter a secret key'); return;
    }
    setIsLoading(true);
    try {
      let out: string;
      if (op === 'encrypt') out = await encryptText(src, selectedAlgorithm, secretKey);
      else if (op === 'decrypt') out = await decryptText(src, selectedAlgorithm, secretKey);
      else out = await hashText(src, selectedAlgorithm);
      setResult(out);
      addHistory({ algorithm: selectedAlgorithm, operation: op, inputPreview: src.slice(0, 60), outputPreview: out.slice(0, 60) });
      pushNotification('success', `${op.charAt(0).toUpperCase() + op.slice(1)}ion successful with ${algo?.name}`);
    } catch (err) {
      pushNotification('error', err instanceof Error ? err.message : 'Operation failed');
    } finally { setIsLoading(false); }
  }, [plaintext, secretKey, selectedAlgorithm, algo, setIsLoading, setResult, addHistory, pushNotification]);

  const handleCopy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); pushNotification('success', 'Copied to clipboard'); }
    catch { pushNotification('error', 'Failed to copy'); }
  };

  const handleDownload = () => {
    if (!result) return;
    const b = new Blob([result], { type: 'text/plain' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = `${selectedAlgorithm}-result.txt`; a.click();
    URL.revokeObjectURL(u);
  };

  const isHashAlgo = algo?.isHashOnly ?? false;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          Encryption Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Select an algorithm and perform cryptographic operations</p>
      </div>

      {/* ── Algorithm Selector ── */}
      <motion.div layout className="glass-card rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Algorithm</label>
            <select value={selectedAlgorithm} onChange={(e) => { setSelectedAlgorithm(e.target.value); setResult(''); }}
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all appearance-none cursor-pointer">
              <optgroup label="Classical Ciphers">
                {ALGORITHMS.filter((a) => a.category === 'classical').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
              <optgroup label="Modern Encryption">
                {ALGORITHMS.filter((a) => a.category === 'symmetric' || a.category === 'asymmetric').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
              <optgroup label="Hashing">
                {ALGORITHMS.filter((a) => a.category === 'hashing').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
            </select>
          </div>
          {algo && (
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catColor(algo.category)}`}>{algo.category}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${secColor(algo.securityLevel)}`}>{algo.securityLevel}</span>
                {algo.isHashOnly && <span className="flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="w-3 h-3" />One-way only</span>}
              </div>
              <p className="text-xs text-slate-500 mt-2">{algo.description}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" /> Input
          </h2>

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              {isHashAlgo ? 'Text to Hash' : 'Plain Text'}
            </label>
            <textarea value={plaintext} onChange={(e) => setPlaintext(e.target.value)}
              placeholder={isHashAlgo ? 'Enter text to hash...' : 'Enter text to encrypt...'}
              rows={5}
              className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 resize-none transition-all font-mono" />
            <div className="text-right text-xs text-slate-500 mt-1">{plaintext.length} chars</div>
          </div>

          {!isHashAlgo && (
            <div className="mb-5">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Secret Key
              </label>
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={selectedAlgorithm === 'rsa' ? 'Paste public key (encrypt) or private key (decrypt)' : algo?.keyRequirements ?? 'Enter secret key'}
                  className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all font-mono" />
                <button onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {algo && <p className="text-xs text-slate-500 mt-1">{algo.keyRequirements}</p>}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!isHashAlgo && (
              <>
                <button onClick={() => doOp('encrypt')} disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Encrypt
                </button>
                <button onClick={() => doOp('decrypt')} disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                  Decrypt
                </button>
              </>
            )}
            {isHashAlgo && (
              <button onClick={() => doOp('hash')} disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                Hash
              </button>
            )}
            <button onClick={() => { resetForm(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/60 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 transition-all hover:scale-105 active:scale-95">
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Result
          </h2>

          <div className="relative">
            <pre className="w-full min-h-[200px] bg-slate-800/60 border border-slate-700/40 rounded-lg px-4 py-3 text-sm text-emerald-400 font-mono whitespace-pre-wrap break-all overflow-auto max-h-[300px]">
              {result || <span className="text-slate-600">Result will appear here...</span>}
            </pre>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">{result.length} chars</span>
            <div className="flex gap-2">
              <button onClick={handleCopy} disabled={!result}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 disabled:opacity-40 transition-all">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={handleDownload} disabled={!result}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 disabled:opacity-40 transition-all">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>

          {/* Algorithm info */}
          {algo && (
            <div className="mt-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">{algo.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{algo.howItWorks}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Operation History
          </h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Clear All</button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-8">No operations yet. Start encrypting!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/20">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${catColor(getAlgorithm(h.algorithm)?.category ?? '')}`}>
                  {getAlgorithm(h.algorithm)?.name ?? h.algorithm}
                </span>
                <span className={`text-xs font-semibold uppercase ${opColor(h.operation)}`}>{h.operation}</span>
                <span className="text-xs text-slate-500 truncate flex-1">{h.inputPreview}</span>
                <span className="text-xs text-slate-600">→</span>
                <span className="text-xs text-slate-500 truncate max-w-[120px]">{h.outputPreview}</span>
                <span className="text-xs text-slate-600 whitespace-nowrap">{new Date(h.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
