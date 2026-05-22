import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, Hash, Binary, ChevronDown, Shield } from 'lucide-react';
import { ALGORITHMS } from '../crypto';
import type { AlgorithmInfo } from '../types';

function catColor(cat: string) {
  const m: Record<string, string> = {
    classical: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    symmetric: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    asymmetric: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    hashing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  return m[cat] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20';
}
function secColor(lvl: string) {
  const m: Record<string, string> = {
    Broken: 'bg-red-500/15 text-red-400', Low: 'bg-amber-500/15 text-amber-400',
    Medium: 'bg-yellow-500/15 text-yellow-400', High: 'bg-cyan-500/15 text-cyan-400',
    'Very High': 'bg-emerald-500/15 text-emerald-400',
  };
  return m[lvl] ?? 'bg-slate-500/15 text-slate-400';
}
function catIcon(cat: string) {
  const m: Record<string, typeof Shield> = {
    classical: Binary, symmetric: Lock, asymmetric: Key, hashing: Hash,
  };
  return m[cat] ?? Shield;
}

function AlgoCard({ algo }: { algo: AlgorithmInfo }) {
  const [open, setOpen] = useState(false);
  const Icon = catIcon(algo.category);
  return (
    <motion.div layout className="glass-card rounded-xl overflow-hidden hover-glow transition-all duration-300">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${catColor(algo.category)}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base font-semibold text-white">{algo.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catColor(algo.category)}`}>
              {algo.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${secColor(algo.securityLevel)}`}>
              {algo.securityLevel}
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{algo.description}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-1">
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-2 border-t border-slate-700/30 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">History</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{algo.history}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">How It Works</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{algo.howItWorks}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Key Requirements</h4>
                <p className="text-sm text-slate-400">{algo.keyRequirements}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Use Cases</h4>
                <ul className="space-y-1">
                  {algo.useCases.map((uc) => (
                    <li key={uc} className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />{uc}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 pt-2">
                {algo.supportsEncrypt && <span className="px-2.5 py-1 rounded text-xs bg-cyan-500/10 text-cyan-400">Encrypt</span>}
                {algo.supportsDecrypt && <span className="px-2.5 py-1 rounded text-xs bg-purple-500/10 text-purple-400">Decrypt</span>}
                {algo.supportsHash && <span className="px-2.5 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400">Hash</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CATS = ['classical', 'symmetric', 'asymmetric', 'hashing'] as const;

export default function AlgorithmExplorer() {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? ALGORITHMS : ALGORITHMS.filter((a) => a.category === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          Algorithm Explorer
        </h1>
        <p className="text-slate-400 mt-2">Explore and learn about each cryptographic algorithm</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...CATS].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === c ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/30 hover:bg-slate-700/60'
            }`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((algo) => <AlgoCard key={algo.id} algo={algo} />)}
      </div>
    </motion.div>
  );
}
