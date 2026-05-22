import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Download, Loader2, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateRSAKeys } from '../services/api';
import { Link } from 'react-router-dom';

export default function RSAKeyGenerator() {
  const { rsaPublicKey, rsaPrivateKey, setRsaPublicKey, setRsaPrivateKey, pushNotification } = useStore();
  const [keySize, setKeySize] = useState(2048);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const keys = await generateRSAKeys(keySize);
      setRsaPublicKey(keys.publicKey);
      setRsaPrivateKey(keys.privateKey);
      pushNotification('success', `Generated ${keySize}-bit RSA key pair`);
    } catch (err) {
      pushNotification('error', err instanceof Error ? err.message : 'Key generation failed');
    } finally { setLoading(false); }
  };

  const copyKey = async (key: string, label: string) => {
    try { await navigator.clipboard.writeText(key); pushNotification('success', `${label} copied`); }
    catch { pushNotification('error', 'Failed to copy'); }
  };

  const downloadKey = (key: string, filename: string) => {
    const b = new Blob([key], { type: 'text/plain' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = filename; a.click();
    URL.revokeObjectURL(u);
  };

  const formatKey = (k: string) => {
    const lines = [];
    for (let i = 0; i < k.length; i += 64) lines.push(k.slice(i, i + 64));
    return lines.join('\n');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          RSA Key Generator
        </h1>
        <p className="text-slate-400 mt-2">Generate RSA public/private key pairs for asymmetric encryption</p>
      </div>

      {/* Config */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Key Size</label>
            <div className="flex gap-2">
              {[2048, 3072, 4096].map((s) => (
                <button key={s} onClick={() => setKeySize(s)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    keySize === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/30 hover:bg-slate-700/60'
                  }`}>
                  {s}-bit
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Generate Keys
          </button>
        </div>
      </div>

      {rsaPublicKey && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Public Key */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" /> Public Key
              </h3>
              <div className="flex gap-2">
                <button onClick={() => copyKey(rsaPublicKey, 'Public key')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => downloadKey(rsaPublicKey, 'rsa-public-key.txt')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <pre className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-auto max-h-48 leading-relaxed">
              {formatKey(rsaPublicKey)}
            </pre>
          </div>

          {/* Private Key */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" /> Private Key <span className="text-[10px] text-red-400/60 normal-case font-normal">(keep secure)</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => copyKey(rsaPrivateKey, 'Private key')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => downloadKey(rsaPrivateKey, 'rsa-private-key.txt')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <pre className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-4 text-xs text-amber-400 font-mono overflow-auto max-h-48 leading-relaxed">
              {formatKey(rsaPrivateKey)}
            </pre>
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-xl p-6 border-cyan-500/20">
            <h3 className="text-sm font-semibold text-white mb-3">How to use these keys</h3>
            <ol className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">1.</span> Go to the <Link to="/dashboard" className="text-cyan-400 hover:underline">Encryption Dashboard</Link></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">2.</span> Select <strong className="text-white">RSA</strong> from the algorithm dropdown</li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">3.</span> To encrypt: paste the <strong className="text-cyan-400">public key</strong> into the key field, enter plaintext, and click Encrypt</li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">4.</span> To decrypt: paste the <strong className="text-red-400">private key</strong> into the key field, enter ciphertext, and click Decrypt</li>
            </ol>
            <Link to="/dashboard" className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
