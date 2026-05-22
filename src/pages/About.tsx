import { motion } from 'framer-motion';
import { BookOpen, Shield, Lock, Key, Hash, Cpu, Binary, Zap } from 'lucide-react';

const TIMELINE = [
  { year: '~700 BC', title: 'Scytale Cipher', desc: 'Ancient Spartans used a cylindrical tool to create transposition ciphers on parchment strips.' },
  { year: '~50 BC', title: 'Caesar Cipher', desc: 'Julius Caesar used a simple letter-shift substitution cipher for military correspondence.' },
  { year: '1553', title: 'Vigenère Cipher', desc: 'Giovan Battista Bellaso creates the first polyalphabetic cipher, later misattributed to Vigenère.' },
  { year: '1917', title: 'Vernam Cipher (OTP)', desc: 'Gilbert Vernam invents the one-time pad, proven to provide perfect secrecy.' },
  { year: '1854', title: 'Playfair Cipher', desc: 'Charles Wheatstone develops the first practical digraph substitution cipher.' },
  { year: '1977', title: 'RSA', desc: 'Rivest, Shamir, and Adleman publish the first practical public-key cryptosystem.' },
  { year: '1977', title: 'DES', desc: 'NIST adopts IBM\'s Lucifer cipher as the Data Encryption Standard.' },
  { year: '1987', title: 'RC4', desc: 'Ron Rivest designs RC4 stream cipher. Kept secret until leaked in 1994.' },
  { year: '1991', title: 'MD5', desc: 'Ronald Rivest designs MD5 as a successor to MD4. Later found to be insecure.' },
  { year: '1995', title: 'SHA-1', desc: 'NSA designs SHA-1. Broken via collision attack by Google in 2017.' },
  { year: '2001', title: 'AES', desc: 'NIST selects Rijndael as the Advanced Encryption Standard, replacing DES.' },
  { year: '2001', title: 'SHA-256', desc: 'SHA-2 family published. SHA-256 becomes the backbone of blockchain and TLS.' },
];

const SECTIONS = [
  {
    Icon: Binary,
    title: 'Classical Cryptography',
    desc: 'The earliest forms of encryption relied on substitution and transposition. Classical ciphers like Vigenère and Playfair operate on individual letters or pairs of letters, providing a foundation for understanding cryptographic principles. While no longer secure by modern standards, they remain essential teaching tools.',
  },
  {
    Icon: Lock,
    title: 'Symmetric Encryption',
    desc: 'Symmetric encryption uses the same key for both encryption and decryption. Algorithms like DES, AES, and RC4 process data in blocks or streams. AES-256, with its 256-bit key, is the current gold standard for symmetric encryption, used to secure everything from WiFi to government communications.',
  },
  {
    Icon: Key,
    title: 'Asymmetric Encryption',
    desc: 'Asymmetric (public-key) cryptography uses mathematically related key pairs: a public key for encryption and a private key for decryption. RSA, the most widely deployed asymmetric algorithm, derives its security from the computational difficulty of factoring large prime numbers.',
  },
  {
    Icon: Hash,
    title: 'Cryptographic Hashing',
    desc: 'Hash functions produce fixed-size digests from arbitrary input. They are one-way: computationally infeasible to reverse. SHA-256 is used in blockchain, digital signatures, and password storage. MD5 and SHA-1 are deprecated for security use but remain important for compatibility.',
  },
];

export default function About() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          About Cryptography
        </h1>
        <p className="text-slate-400 mt-2">A brief history and educational overview of cryptographic algorithms</p>
      </div>

      {/* Introduction */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What is Cryptography?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cryptography is the practice and study of techniques for secure communication in the
              presence of adversarial behavior. From ancient substitution ciphers to modern
              quantum-resistant algorithms, cryptography has been fundamental to protecting
              information for millennia. This platform implements algorithms spanning over 2,700
              years of cryptographic history.
            </p>
          </div>
        </div>
      </div>

      {/* Cryptography Types */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {SECTIONS.map((s) => (
          <div key={s.title} className="glass-card rounded-xl p-5 hover-glow transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <s.Icon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">{s.title}</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* How this platform works */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" /> How This Platform Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">FastAPI Backend</h4>
            <p className="text-xs text-slate-400">All cryptographic operations run on a Python FastAPI server with proper validation and error handling.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">React Web Client</h4>
            <p className="text-xs text-slate-400">Enterprise-grade TypeScript frontend with Tailwind CSS, consuming the FastAPI REST API.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Streamlit Desktop</h4>
            <p className="text-xs text-slate-400">Full-featured Streamlit desktop client sharing the same FastAPI backend for maximum flexibility.</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" /> Timeline of Cryptography
        </h2>
        <div className="space-y-0">
          {TIMELINE.map((t, i) => (
            <div key={t.year + t.title} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                  i === TIMELINE.length - 1 ? 'bg-cyan-400 border-cyan-400' : 'bg-slate-800 border-slate-600 group-hover:border-cyan-400 transition-colors'
                }`} />
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-slate-700/50" />}
              </div>
              <div className="pb-6">
                <span className="text-xs font-mono text-cyan-400">{t.year}</span>
                <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
