import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Menu, X, Wifi, WifiOff, Home, Lock, BookOpen, Key, Code, Info,
  CheckCircle, XCircle, AlertTriangle, AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { checkHealth } from '../services/api';

const NAV = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/dashboard', label: 'Dashboard', Icon: Lock },
  { to: '/algorithms', label: 'Algorithms', Icon: BookOpen },
  { to: '/rsa-keys', label: 'RSA Keys', Icon: Key },
  { to: '/api-docs', label: 'API Docs', Icon: Code },
  { to: '/about', label: 'About', Icon: Info },
];

const N_ICONS: Record<string, typeof CheckCircle> = {
  success: CheckCircle, error: XCircle, warning: AlertTriangle, info: AlertCircle,
};
const N_COLORS: Record<string, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/20 border-red-500/30 text-red-300',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  info: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
};

export default function Layout() {
  const [mobile, setMobile] = useState(false);
  const loc = useLocation();
  const { apiConnected, setApiConnected, notifications, dismissNotification } = useStore();

  useEffect(() => {
    checkHealth().then(setApiConnected);
    const t = setInterval(() => checkHealth().then(setApiConnected), 30000);
    return () => clearInterval(t);
  }, [setApiConnected]);

  useEffect(() => { setMobile(false); }, [loc]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient-cyan">Crypto</span>
              <span className="text-white">Vault</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label, Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-400 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              apiConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}>
              {apiConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{apiConnected ? 'API Connected' : 'Offline Mode'}</span>
            </div>
            <button onClick={() => setMobile(!mobile)} className="md:hidden text-slate-400 hover:text-white transition-colors">
              {mobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 w-72 z-50 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 pt-20 px-4"
          >
            {NAV.map(({ to, label, Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all ${
                    active ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}>
                  <Icon className="w-5 h-5" />{label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notifications ── */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => {
            const NIcon = N_ICONS[n.type] ?? AlertCircle;
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                className={`flex items-start gap-3 p-3 rounded-xl border backdrop-blur-xl pointer-events-auto ${N_COLORS[n.type]}`}
              >
                <NIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm flex-1 leading-relaxed">{n.message}</p>
                <button onClick={() => dismissNotification(n.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Content ── */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
