import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Layers, Zap, Key, BookOpen, Code, ArrowRight,
  Lock, Hash, Cpu, Binary, Globe, ChevronRight,
} from 'lucide-react';

const STATS = [
  { value: '10+', label: 'Algorithms', Icon: Layers },
  { value: '4', label: 'Categories', Icon: Cpu },
  { value: '256-bit', label: 'Encryption', Icon: Lock },
  { value: 'REST API', label: 'Architecture', Icon: Code },
];

const FEATURES = [
  { Icon: Layers, title: 'Multi-Algorithm Support', desc: '10+ algorithms from classical Vigenère to modern AES-256 encryption.', gradient: 'from-cyan-500 to-blue-600' },
  { Icon: Zap, title: 'Real-Time Operations', desc: 'Instant encryption, decryption, and hashing powered by optimized implementations.', gradient: 'from-amber-500 to-orange-600' },
  { Icon: Key, title: 'RSA Key Generation', desc: 'Generate 2048-bit and 4096-bit RSA key pairs for asymmetric encryption.', gradient: 'from-purple-500 to-pink-600' },
  { Icon: BookOpen, title: 'Algorithm Explorer', desc: 'Interactive educational panels with history, mechanics, and security analysis.', gradient: 'from-emerald-500 to-teal-600' },
  { Icon: Code, title: 'FastAPI Backend', desc: 'Professional REST API with OpenAPI documentation and proper error handling.', gradient: 'from-blue-500 to-indigo-600' },
  { Icon: Globe, title: 'Dual Interface', desc: 'React web client and Streamlit desktop client sharing one unified backend.', gradient: 'from-rose-500 to-red-600' },
];

const CATEGORIES = [
  { name: 'Classical Ciphers', algos: ['Vigenère', 'Vernam (OTP)', 'Playfair'], Icon: Binary, color: 'border-amber-500/30 bg-amber-500/5' },
  { name: 'Symmetric Encryption', algos: ['DES', 'AES-256', 'RC4'], Icon: Lock, color: 'border-cyan-500/30 bg-cyan-500/5' },
  { name: 'Asymmetric Encryption', algos: ['RSA-OAEP'], Icon: Key, color: 'border-purple-500/30 bg-purple-500/5' },
  { name: 'Cryptographic Hashing', algos: ['MD5', 'SHA-1', 'SHA-256'], Icon: Hash, color: 'border-emerald-500/30 bg-emerald-500/5' },
];

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } };

export default function LandingPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* ════ Hero ════ */}
      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.15) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Enterprise-Grade Cryptography</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-gradient-cyan">Multi-Algorithm</span>
              <br />
              <span className="text-white">Encryption Platform</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Encrypt, decrypt, hash, and explore cryptographic algorithms — from classical
              ciphers to modern AES-256 and RSA encryption.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200">
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/algorithms"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 hover:scale-105 transition-all duration-200">
                Explore Algorithms <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ════ Stats ════ */}
      <section className="py-16 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center hover-glow transition-all duration-300">
                <s.Icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ Features ════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-cyan">Powerful Features</span> for Every Use Case
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A comprehensive cryptography platform designed for professionals, students, and security enthusiasts.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...stagger} transition={{ delay: i * 0.08, duration: 0.5 }} viewport={{ once: true }}
                className="glass-card rounded-xl p-6 group hover-glow transition-all duration-300 cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ Algorithm Categories ════ */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Four Pillars of <span className="text-gradient-purple">Cryptography</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From ancient substitution ciphers to quantum-resistant algorithms.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}
                className={`rounded-xl p-6 border ${cat.color} hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <cat.Icon className="w-6 h-6 text-slate-300" />
                  <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.algos.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {a}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient-cyan">Secure</span> Your Data?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Launch the dashboard and start encrypting with professional-grade algorithms in seconds.
            </p>
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200">
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════ Footer ════ */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-slate-400">CryptoVault</span>
          </div>
          <p className="text-xs text-slate-500">Built with React, TypeScript, Tailwind CSS, FastAPI & Streamlit</p>
        </div>
      </footer>
    </motion.div>
  );
}
