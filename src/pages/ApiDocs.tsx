import { motion } from 'framer-motion';
import { Code, ArrowRight, Copy } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Endpoint {
  method: string;
  path: string;
  desc: string;
  body?: string;
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET', path: '/health', desc: 'Check if the FastAPI backend is running and healthy.',
    response: '{ "status": "healthy", "version": "1.0.0" }',
  },
  {
    method: 'GET', path: '/algorithms', desc: 'Retrieve a list of all supported cryptographic algorithms with metadata.',
    response: `{
  "algorithms": [
    {
      "id": "aes",
      "name": "AES",
      "category": "symmetric",
      "supports_encrypt": true,
      "supports_decrypt": true,
      "is_hash_only": false
    }
  ]
}`,
  },
  {
    method: 'POST', path: '/encrypt', desc: 'Encrypt plaintext using the specified algorithm and key.',
    body: `{
  "text": "Hello, World!",
  "algorithm": "aes",
  "key": "my-secret-key-123"
}`,
    response: `{
  "success": true,
  "result": "U2FsdGVkX1...",
  "algorithm": "aes",
  "operation": "encrypt"
}`,
  },
  {
    method: 'POST', path: '/decrypt', desc: 'Decrypt ciphertext using the specified algorithm and key.',
    body: `{
  "text": "U2FsdGVkX1...",
  "algorithm": "aes",
  "key": "my-secret-key-123"
}`,
    response: `{
  "success": true,
  "result": "Hello, World!",
  "algorithm": "aes",
  "operation": "decrypt"
}`,
  },
  {
    method: 'POST', path: '/hash', desc: 'Generate a cryptographic hash of the input text.',
    body: `{
  "text": "Hello, World!",
  "algorithm": "sha256"
}`,
    response: `{
  "success": true,
  "hash": "dffd6021bb2b...",
  "algorithm": "sha256"
}`,
  },
  {
    method: 'POST', path: '/generate-rsa-keys', desc: 'Generate an RSA public/private key pair.',
    body: `{
  "key_size": 2048
}`,
    response: `{
  "success": true,
  "public_key": "MIIBIjANBg...",
  "private_key": "MIIEvQIBAD...",
  "key_size": 2048
}`,
  },
];

function methodColor(m: string) {
  return m === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400';
}

function CodeBlock({ code }: { code: string }) {
  const { pushNotification } = useStore();
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); pushNotification('success', 'Copied'); }
    catch { pushNotification('error', 'Failed to copy'); }
  };
  return (
    <div className="relative group">
      <pre className="bg-slate-900/80 border border-slate-700/40 rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-slate-700/60 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          API Documentation
        </h1>
        <p className="text-slate-400 mt-2">FastAPI REST API endpoints for the CryptoVault backend</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <span>Base URL:</span>
          <code className="px-2 py-0.5 bg-slate-800 rounded text-cyan-400">http://localhost:8000</code>
        </div>
      </div>

      {/* Quickstart */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Quick Start</h2>
        <div className="space-y-3 text-sm text-slate-400">
          <p>1. Install the backend dependencies:</p>
          <CodeBlock code="pip install -r backend/requirements.txt" />
          <p>2. Start the FastAPI server:</p>
          <CodeBlock code="cd backend && uvicorn app.main:app --reload --port 8000" />
          <p>3. Access the interactive Swagger docs:</p>
          <CodeBlock code="http://localhost:8000/docs" />
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {ENDPOINTS.map((ep) => (
          <div key={ep.method + ep.path} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${methodColor(ep.method)}`}>{ep.method}</span>
              <code className="text-sm text-white font-mono">{ep.path}</code>
            </div>
            <p className="text-sm text-slate-400 mb-4">{ep.desc}</p>

            {ep.body && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Request Body</h4>
                <CodeBlock code={ep.body} />
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Response</h4>
              <CodeBlock code={ep.response} />
            </div>
          </div>
        ))}
      </div>

      {/* Architecture note */}
      <div className="glass-card rounded-xl p-6 mt-8 border-cyan-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">Architecture Note</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          The React frontend attempts to communicate with this FastAPI backend first.
          When the backend is unavailable, it gracefully falls back to client-side cryptographic
          implementations (marked as "Offline Mode"). Both modes produce identical results.
        </p>
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          See the Swagger docs at <code className="text-cyan-400">/docs</code> for full OpenAPI specification
        </div>
      </div>
    </motion.div>
  );
}
