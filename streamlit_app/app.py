"""
CryptoVault — Premium Encryption Dashboard
============================================
Modern, professional desktop interface for the CryptoVault platform.
Consumes the FastAPI backend via REST API.
Fully responsive, animated, dark-themed SaaS-grade UI.
"""

import streamlit as st
import requests
import json
from datetime import datetime

API_URL = "http://localhost:8000"

# ── Page Config ──
st.set_page_config(
    page_title="CryptoVault — Encryption Platform",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ════════════════════════════════════════════════════════════════
#  GLOBAL CSS — Theme, Animations, Glassmorphism, Responsive
# ════════════════════════════════════════════════════════════════
st.markdown("""
<style>
    /* ── Import premium fonts ── */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    /* ── CSS Variables ── */
    :root {
        --bg-primary: #0a0e1a;
        --bg-secondary: #111827;
        --bg-card: rgba(17, 24, 39, 0.6);
        --bg-card-hover: rgba(17, 24, 39, 0.8);
        --border-subtle: rgba(148, 163, 184, 0.08);
        --border-glow: rgba(6, 182, 212, 0.3);
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --accent-cyan: #06b6d4;
        --accent-purple: #8b5cf6;
        --accent-amber: #f59e0b;
        --accent-emerald: #10b981;
        --accent-rose: #f43f5e;
        --accent-blue: #3b82f6;
        --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.15);
        --glow-purple: 0 0 20px rgba(139, 92, 246, 0.15);
        --radius-sm: 8px;
        --radius-md: 14px;
        --radius-lg: 20px;
        --radius-xl: 24px;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Global Resets ── */
    .stApp {
        background: var(--bg-primary) !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text-primary);
    }

    /* ── Animated background mesh ── */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.15);
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.25); }

    /* ── Keyframe Animations ── */
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.2); }
        50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes borderGlow {
        0%, 100% { border-color: rgba(6, 182, 212, 0.15); }
        50% { border-color: rgba(6, 182, 212, 0.4); }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }

    /* ── Animation Classes ── */
    .anim-fade-up { animation: fadeInUp 0.6s ease-out forwards; }
    .anim-fade { animation: fadeIn 0.5s ease-out forwards; }
    .anim-slide-left { animation: slideInLeft 0.5s ease-out forwards; }
    .anim-slide-right { animation: slideInRight 0.5s ease-out forwards; }
    .anim-scale { animation: scaleIn 0.4s ease-out forwards; }
    .anim-delay-1 { animation-delay: 0.1s; opacity: 0; }
    .anim-delay-2 { animation-delay: 0.2s; opacity: 0; }
    .anim-delay-3 { animation-delay: 0.3s; opacity: 0; }
    .anim-delay-4 { animation-delay: 0.4s; opacity: 0; }

    /* ── Sidebar ── */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0c1120 0%, #0f172a 50%, #0c1120 100%) !important;
        border-right: 1px solid var(--border-subtle) !important;
    }
    section[data-testid="stSidebar"] > div:first-child {
        padding-top: 1.5rem;
    }
    section[data-testid="stSidebar"] .stRadio > div {
        gap: 4px;
    }
    section[data-testid="stSidebar"] .stRadio label {
        padding: 10px 14px;
        border-radius: var(--radius-md);
        transition: var(--transition);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
        border: 1px solid transparent;
    }
    section[data-testid="stSidebar"] .stRadio label:hover {
        background: rgba(6, 182, 212, 0.06);
        color: var(--text-primary);
        border-color: rgba(6, 182, 212, 0.1);
    }
    section[data-testid="stSidebar"] .stRadio label[data-baseweb="radio"] [aria-checked="true"] {
        background: rgba(6, 182, 212, 0.08);
        color: var(--accent-cyan);
        border-color: rgba(6, 182, 212, 0.2);
    }

    /* ── Glass Card ── */
    .glass-card {
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 28px;
        margin-bottom: 20px;
        transition: var(--transition);
        animation: fadeInUp 0.5s ease-out forwards;
        position: relative;
        overflow: hidden;
    }
    .glass-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.1), transparent);
    }
    .glass-card:hover {
        background: var(--bg-card-hover);
        border-color: rgba(148, 163, 184, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* ── Result Box ── */
    .result-box {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(139, 92, 246, 0.03));
        border: 1px solid rgba(6, 182, 212, 0.15);
        border-radius: var(--radius-md);
        padding: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        line-height: 1.7;
        color: var(--accent-cyan);
        word-break: break-all;
        min-height: 80px;
        transition: var(--transition);
        animation: borderGlow 3s ease-in-out infinite;
        position: relative;
    }
    .result-box:hover {
        border-color: rgba(6, 182, 212, 0.35);
        box-shadow: var(--glow-cyan);
    }

    /* ── Algorithm Badges ── */
    .algo-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        transition: var(--transition);
    }
    .algo-badge:hover { transform: scale(1.05); }
    .badge-classical {
        background: rgba(245, 158, 11, 0.1);
        color: var(--accent-amber);
        border: 1px solid rgba(245, 158, 11, 0.15);
    }
    .badge-symmetric {
        background: rgba(59, 130, 246, 0.1);
        color: var(--accent-blue);
        border: 1px solid rgba(59, 130, 246, 0.15);
    }
    .badge-asymmetric {
        background: rgba(139, 92, 246, 0.1);
        color: var(--accent-purple);
        border: 1px solid rgba(139, 92, 246, 0.15);
    }
    .badge-hashing {
        background: rgba(16, 185, 129, 0.1);
        color: var(--accent-emerald);
        border: 1px solid rgba(16, 185, 129, 0.15);
    }
    .badge-oneway {
        background: rgba(244, 63, 94, 0.1);
        color: var(--accent-rose);
        border: 1px solid rgba(244, 63, 94, 0.15);
    }

    /* ── Page Title ── */
    .page-title {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 4px;
        letter-spacing: -0.5px;
        animation: fadeInUp 0.5s ease-out forwards;
    }
    .page-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        font-weight: 400;
        margin-bottom: 2rem;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 0.1s;
        opacity: 0;
    }

    /* ── Section Header ── */
    .section-header {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .section-header .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-cyan);
        animation: pulseGlow 2s ease-in-out infinite;
    }

    /* ── Status Indicator ── */
    .status-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
        animation: pulseGlow 2s ease-in-out infinite;
    }
    .status-online { background: var(--accent-emerald); box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
    .status-offline { background: var(--accent-amber); box-shadow: 0 0 8px rgba(245, 158, 11, 0.5); }

    /* ── Sidebar Branding ── */
    .sidebar-brand {
        text-align: center;
        padding: 0 0 1.5rem 0;
        border-bottom: 1px solid var(--border-subtle);
        margin-bottom: 1.5rem;
        animation: fadeIn 0.5s ease-out forwards;
    }
    .sidebar-brand-name {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.3px;
    }
    .sidebar-brand-name span {
        background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .sidebar-brand-tagline {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 4px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    /* ── Sidebar Footer ── */
    .sidebar-footer {
        text-align: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-subtle);
        margin-top: auto;
    }
    .sidebar-footer p {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin: 2px 0;
    }

    /* ── Status Card ── */
    .status-card {
        background: rgba(17, 24, 39, 0.4);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 12px 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 500;
        transition: var(--transition);
    }
    .status-card:hover { border-color: rgba(148, 163, 184, 0.15); }
    .status-card.online { color: var(--accent-emerald); }
    .status-card.offline { color: var(--accent-amber); }

    /* ── Streamlit Input Overrides ── */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea {
        background: rgba(17, 24, 39, 0.5) !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-sm) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.875rem !important;
        transition: var(--transition) !important;
    }
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: rgba(6, 182, 212, 0.3) !important;
        box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08) !important;
    }
    .stTextInput > div > div > input::placeholder,
    .stTextArea > div > div > textarea::placeholder {
        color: var(--text-muted) !important;
    }
    .stSelectbox > div > div > select {
        background: rgba(17, 24, 39, 0.5) !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-sm) !important;
    }
    .stSelectbox > div > div > select:focus {
        border-color: rgba(6, 182, 212, 0.3) !important;
    }

    /* ── Label Styling ── */
    .stTextInput > label, .stTextArea > label, .stSelectbox > label {
        font-size: 0.8rem !important;
        font-weight: 500 !important;
        color: var(--text-secondary) !important;
        letter-spacing: 0.2px;
    }

    /* ── Button Overrides ── */
    .stButton > button {
        border-radius: var(--radius-sm) !important;
        font-family: 'Inter', sans-serif !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        transition: var(--transition) !important;
        border: 1px solid transparent !important;
        letter-spacing: 0.2px;
    }
    .stButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
    }
    .stButton > button:active {
        transform: translateY(0) !important;
    }
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, var(--accent-cyan), #0891b2) !important;
        color: #fff !important;
        box-shadow: 0 2px 12px rgba(6, 182, 212, 0.25) !important;
    }
    .stButton > button[kind="primary"]:hover {
        box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4) !important;
    }
    .stButton > button[kind="secondary"] {
        background: rgba(148, 163, 184, 0.08) !important;
        color: var(--text-secondary) !important;
        border: 1px solid var(--border-subtle) !important;
    }
    .stButton > button[kind="secondary"]:hover {
        background: rgba(148, 163, 184, 0.12) !important;
        color: var(--text-primary) !important;
        border-color: rgba(148, 163, 184, 0.2) !important;
    }

    /* ── Toast overrides ── */
    .stToast {
        background: rgba(17, 24, 39, 0.95) !important;
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-md) !important;
        color: var(--text-primary) !important;
    }

    /* ── Success/Error boxes ── */
    .stSuccess, .stWarning, .stError, .stInfo {
        border-radius: var(--radius-sm) !important;
        backdrop-filter: blur(8px);
    }
    [data-testid="stSuccess"] {
        background: rgba(16, 185, 129, 0.08) !important;
        border: 1px solid rgba(16, 185, 129, 0.15) !important;
        color: var(--accent-emerald) !important;
    }
    [data-testid="stWarning"] {
        background: rgba(245, 158, 11, 0.08) !important;
        border: 1px solid rgba(245, 158, 11, 0.15) !important;
        color: var(--accent-amber) !important;
    }
    [data-testid="stError"] {
        background: rgba(244, 63, 94, 0.08) !important;
        border: 1px solid rgba(244, 63, 94, 0.15) !important;
        color: var(--accent-rose) !important;
    }
    [data-testid="stInfo"] {
        background: rgba(59, 130, 246, 0.08) !important;
        border: 1px solid rgba(59, 130, 246, 0.15) !important;
        color: var(--accent-blue) !important;
    }

    /* ── Spinner ── */
    .stSpinner > div {
        border-color: var(--accent-cyan) transparent transparent transparent !important;
    }

    /* ── Code Block ── */
    .stCodeBlock {
        border-radius: var(--radius-sm) !important;
    }
    code {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
    }
    pre {
        background: rgba(17, 24, 39, 0.5) !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-sm) !important;
    }

    /* ── Expander ── */
    .stExpander {
        background: var(--bg-card) !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-md) !important;
        transition: var(--transition);
        margin-bottom: 8px !important;
    }
    .stExpander:hover {
        border-color: rgba(148, 163, 184, 0.15) !important;
        background: var(--bg-card-hover) !important;
    }
    .stExpander > div > div > p {
        font-weight: 600 !important;
        color: var(--text-primary) !important;
    }

    /* ── History Card ── */
    .history-card {
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 18px 22px;
        margin-bottom: 12px;
        transition: var(--transition);
        animation: fadeInUp 0.4s ease-out forwards;
        position: relative;
        overflow: hidden;
    }
    .history-card::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        border-radius: 0 3px 3px 0;
    }
    .history-card.encrypt::before { background: var(--accent-cyan); }
    .history-card.decrypt::before { background: var(--accent-purple); }
    .history-card.hash::before { background: var(--accent-emerald); }
    .history-card:hover {
        background: var(--bg-card-hover);
        border-color: rgba(148, 163, 184, 0.15);
        transform: translateX(4px);
    }
    .history-card .op-label {
        font-weight: 600;
        font-size: 0.82rem;
        color: var(--text-primary);
    }
    .history-card .op-meta {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 4px;
    }
    .history-card .op-flow {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        color: var(--text-secondary);
        margin-top: 8px;
        line-height: 1.6;
    }

    /* ── Divider ── */
    hr {
        border-color: var(--border-subtle) !important;
    }

    /* ── Algo Explorer Cards ── */
    .algo-card {
        background: var(--bg-card);
        backdrop-filter: blur(16px);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 20px;
        transition: var(--transition);
        animation: scaleIn 0.4s ease-out forwards;
        cursor: default;
    }
    .algo-card:hover {
        background: var(--bg-card-hover);
        border-color: rgba(148, 163, 184, 0.15);
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    .algo-card-name {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    .algo-card-desc {
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.5;
    }

    /* ── Key Display ── */
    .key-display {
        background: rgba(17, 24, 39, 0.5);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        line-height: 1.8;
        color: var(--text-secondary);
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
        transition: var(--transition);
    }
    .key-display:hover {
        border-color: rgba(148, 163, 184, 0.15);
    }
    .key-label {
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .key-label .icon {
        font-size: 1rem;
    }

    /* ── Empty State ── */
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        animation: fadeIn 0.6s ease-out forwards;
    }
    .empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state .title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 8px;
    }
    .empty-state .desc {
        font-size: 0.85rem;
        color: var(--text-muted);
    }

    /* ── Metric Cards for potential future use ── */
    .metric-card {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 20px;
        text-align: center;
        transition: var(--transition);
    }
    .metric-card:hover {
        border-color: rgba(6, 182, 212, 0.2);
        box-shadow: var(--glow-cyan);
        transform: translateY(-2px);
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .metric-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
        .page-title { font-size: 1.5rem; }
        .glass-card { padding: 20px; }
        .result-box { padding: 14px; font-size: 12px; }
    }

    /* ── Hide default Streamlit elements ── */
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    header { visibility: hidden; }

    /* ── Tooltip / Info text ── */
    .info-tip {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(59, 130, 246, 0.06);
        border: 1px solid rgba(59, 130, 246, 0.1);
        border-radius: var(--radius-sm);
        padding: 14px 18px;
        font-size: 0.82rem;
        color: var(--text-secondary);
        line-height: 1.6;
    }
    .info-tip .icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

    /* ── Colored Divider ── */
    .colored-divider {
        height: 2px;
        background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple), transparent);
        border: none;
        margin: 2rem 0;
        border-radius: 2px;
    }
</style>
""", unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════
#  SESSION STATE
# ════════════════════════════════════════════════════════════════
if "history" not in st.session_state:
    st.session_state.history = []
if "rsa_public" not in st.session_state:
    st.session_state.rsa_public = ""
if "rsa_private" not in st.session_state:
    st.session_state.rsa_private = ""

# ════════════════════════════════════════════════════════════════
#  API HELPERS
# ════════════════════════════════════════════════════════════════
def api_get(path: str):
    try:
        r = requests.get(f"{API_URL}{path}", timeout=5)
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None

def api_post(path: str, data: dict):
    try:
        r = requests.post(f"{API_URL}{path}", json=data, timeout=30)
        return r.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def check_api():
    return api_get("/health") is not None

# ════════════════════════════════════════════════════════════════
#  ALGORITHM DATA
# ════════════════════════════════════════════════════════════════
ALGORITHMS = [
    {"id": "vigenere", "name": "Vigenère Cipher", "category": "classical", "hash_only": False,
     "desc": "Polyalphabetic substitution cipher using a keyword to shift letters. A classic from the 16th century."},
    {"id": "vernan", "name": "Vernam Cipher (OTP)", "category": "classical", "hash_only": False,
     "desc": "One-time pad cipher — provably unbreakable when the key is truly random and used only once."},
    {"id": "playfair", "name": "Playfair Cipher", "category": "classical", "hash_only": False,
     "desc": "Digraph substitution cipher using a 5×5 key matrix. Invented by Charles Wheatstone in 1854."},
    {"id": "des", "name": "DES", "category": "symmetric", "hash_only": False,
     "desc": "Data Encryption Standard — 56-bit symmetric block cipher. Historically significant but now considered insecure."},
    {"id": "aes", "name": "AES-256", "category": "symmetric", "hash_only": False,
     "desc": "Advanced Encryption Standard with 256-bit keys. The gold standard for symmetric encryption worldwide."},
    {"id": "rc4", "name": "RC4", "category": "symmetric", "hash_only": False,
     "desc": "Stream cipher designed by Ron Rivest in 1987. Fast but known to have vulnerabilities."},
    {"id": "rsa", "name": "RSA", "category": "asymmetric", "hash_only": False,
     "desc": "Rivest–Shamir–Adleman — public-key cryptosystem widely used for secure data transmission."},
    {"id": "md5", "name": "MD5", "category": "hashing", "hash_only": True,
     "desc": "Message Digest Algorithm 5 — produces a 128-bit hash. Deprecated for cryptographic use due to collisions."},
    {"id": "sha1", "name": "SHA-1", "category": "hashing", "hash_only": True,
     "desc": "Secure Hash Algorithm 1 — 160-bit digest. Deprecated for most security applications."},
    {"id": "sha256", "name": "SHA-256", "category": "hashing", "hash_only": True,
     "desc": "SHA-2 family 256-bit hash. Widely trusted and used in TLS, Bitcoin, and digital signatures."},
]

CAT_BADGE = {
    "classical": "badge-classical",
    "symmetric": "badge-symmetric",
    "asymmetric": "badge-asymmetric",
    "hashing": "badge-hashing",
}

CAT_ICON = {
    "classical": "📜",
    "symmetric": "🔐",
    "asymmetric": "🗝️",
    "hashing": "🧬",
}

# ════════════════════════════════════════════════════════════════
#  SIDEBAR
# ════════════════════════════════════════════════════════════════
with st.sidebar:
    # ── Branding ──
    st.markdown("""
    <div class="sidebar-brand">
        <div class="sidebar-brand-name">🔐 Crypto<span>Vault</span></div>
        <div class="sidebar-brand-tagline">Encryption Platform</div>
    </div>
    """, unsafe_allow_html=True)

    # ── API Status ──
    api_ok = check_api()
    if api_ok:
        st.markdown("""
        <div class="status-card online">
            <span class="status-dot status-online"></span>
            API Connected
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div class="status-card offline">
            <span class="status-dot status-offline"></span>
            Offline Mode
        </div>
        """, unsafe_allow_html=True)
        st.caption("Using built-in fallback")

    # ── Navigation ──
    page = st.radio(
        "Navigation",
        ["Encrypt / Decrypt", "Hash", "RSA Keys", "Algorithms", "History"],
        label_visibility="collapsed",
    )

    # ── Footer ──
    st.markdown("""
    <div class="sidebar-footer">
        <p>Collaborative project </p>
        <p>© 2026 CryptoVault Team</p>
    </div>
    """, unsafe_allow_html=True)


# ════════════════════════════════════════════════════════════════
#  PAGE: Encrypt / Decrypt
# ════════════════════════════════════════════════════════════════
if page == "Encrypt / Decrypt":
    st.markdown('<div class="page-title">Encryption Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Encrypt and decrypt text using classical and modern algorithms.</div>', unsafe_allow_html=True)
    st.markdown('<hr class="colored-divider">', unsafe_allow_html=True)

    enc_algos = [a for a in ALGORITHMS if not a["hash_only"]]
    algo_names = [a["name"] for a in enc_algos]
    selected_name = st.selectbox("Algorithm", algo_names)
    algo = next(a for a in enc_algos if a["name"] == selected_name)
    cat = algo["category"]

    st.markdown(
        f'<span class="algo-badge {CAT_BADGE[cat]}">{CAT_ICON[cat]} {cat.upper()}</span>',
        unsafe_allow_html=True
    )

    col1, col2 = st.columns(2, gap="large")

    with col1:
        st.markdown("""
        <div class="section-header"><div class="dot"></div> Input</div>
        """, unsafe_allow_html=True)

        plaintext = st.text_area("Plain Text / Ciphertext", height=150, key="enc_input", placeholder="Enter text to encrypt or decrypt...")

        if algo["id"] != "rsa":
            key = st.text_input("Secret Key", type="password", placeholder="Enter your secret key...")
        else:
            key = st.text_area("RSA Key (Public for encrypt, Private for decrypt)", height=100, placeholder="Paste PEM key here...")

        btn_col1, btn_col2 = st.columns(2)
        with btn_col1:
            encrypt_clicked = st.button("🔒 Encrypt", use_container_width=True, type="primary")
        with btn_col2:
            decrypt_clicked = st.button("🔓 Decrypt", use_container_width=True)

        if st.button("🗑️ Clear", use_container_width=True):
            st.rerun()

    with col2:
        st.markdown("""
        <div class="section-header"><div class="dot"></div> Result</div>
        """, unsafe_allow_html=True)

        result = st.session_state.get("enc_result", "")

        if encrypt_clicked and plaintext:
            with st.spinner("🔐 Encrypting..."):
                resp = api_post("/encrypt", {"text": plaintext, "algorithm": algo["id"], "key": key or ""})
                if resp.get("success"):
                    result = resp["result"]
                    st.session_state.enc_result = result
                    st.session_state.history.insert(0, {
                        "algorithm": algo["name"], "operation": "encrypt",
                        "input": plaintext[:60], "output": result[:60],
                        "time": datetime.now().strftime("%H:%M:%S"),
                    })
                    st.toast("✅ Encryption successful!")
                else:
                    st.error(f"Encryption failed: {resp.get('error', resp.get('detail', 'Unknown error'))}")

        if decrypt_clicked and plaintext:
            with st.spinner("🔓 Decrypting..."):
                resp = api_post("/decrypt", {"text": plaintext, "algorithm": algo["id"], "key": key or ""})
                if resp.get("success"):
                    result = resp["result"]
                    st.session_state.enc_result = result
                    st.session_state.history.insert(0, {
                        "algorithm": algo["name"], "operation": "decrypt",
                        "input": plaintext[:60], "output": result[:60],
                        "time": datetime.now().strftime("%H:%M:%S"),
                    })
                    st.toast("✅ Decryption successful!")
                else:
                    st.error(f"Decryption failed: {resp.get('error', resp.get('detail', 'Unknown error'))}")

        if result:
            st.markdown(f'<div class="result-box">{result}</div>', unsafe_allow_html=True)
            st.code(result, language=None)
            if st.button("📋 Copy Result", use_container_width=True):
                st.write(result)


# ════════════════════════════════════════════════════════════════
#  PAGE: Hash
# ════════════════════════════════════════════════════════════════
elif page == "Hash":
    st.markdown('<div class="page-title">Hash</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Generate one-way hash digests. Hashing algorithms do not support decryption.</div>', unsafe_allow_html=True)
    st.markdown('<hr class="colored-divider">', unsafe_allow_html=True)

    hash_algos = [a for a in ALGORITHMS if a["hash_only"]]
    selected = st.selectbox("Hash Algorithm", [a["name"] for a in hash_algos])
    algo = next(a for a in hash_algos if a["name"] == selected)

    st.markdown(
        f'<span class="algo-badge {CAT_BADGE[algo["category"]]}">{CAT_ICON[algo["category"]]} {algo["category"].upper()}</span> '
        f'<span class="algo-badge badge-oneway">⚠ ONE-WAY</span>',
        unsafe_allow_html=True
    )

    st.markdown("""
    <div class="glass-card" style="margin-top: 20px;">
    """, unsafe_allow_html=True)

    text = st.text_area("Text to Hash", height=120, key="hash_input", placeholder="Enter text to hash...")

    if st.button("⚡ Generate Hash", type="primary", use_container_width=True) and text:
        with st.spinner("🧬 Hashing..."):
            resp = api_post("/hash", {"text": text, "algorithm": algo["id"]})
            if resp.get("success"):
                h = resp.get("hash", resp.get("result", ""))
                st.markdown("""
                <div class="section-header" style="margin-top: 16px;"><div class="dot"></div> Hash Result</div>
                """, unsafe_allow_html=True)
                st.markdown(f'<div class="result-box">{h}</div>', unsafe_allow_html=True)
                st.code(h, language=None)
                st.session_state.history.insert(0, {
                    "algorithm": algo["name"], "operation": "hash",
                    "input": text[:60], "output": h[:60],
                    "time": datetime.now().strftime("%H:%M:%S"),
                })
                st.toast("✅ Hash generated!")
            else:
                st.error(f"Hashing failed: {resp.get('error', resp.get('detail', 'Unknown'))}")

    st.markdown("</div>", unsafe_allow_html=True)


# ════════════════════════════════════════════════════════════════
#  PAGE: RSA Keys
# ════════════════════════════════════════════════════════════════
elif page == "RSA Keys":
    st.markdown('<div class="page-title">RSA Key Generator</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Generate public/private key pairs for asymmetric encryption.</div>', unsafe_allow_html=True)
    st.markdown('<hr class="colored-divider">', unsafe_allow_html=True)

    st.markdown('<div class="glass-card">', unsafe_allow_html=True)

    key_size = st.selectbox("Key Size", [2048, 3072, 4096], index=0)

    if st.button("🔄 Generate RSA Keys", type="primary", use_container_width=True):
        with st.spinner(f"🔑 Generating {key_size}-bit RSA keys... This may take a moment."):
            resp = api_post("/generate-rsa-keys", {"key_size": key_size})
            if resp.get("success"):
                st.session_state.rsa_public = resp["public_key"]
                st.session_state.rsa_private = resp["private_key"]
                st.toast(f"✅ {key_size}-bit RSA keys generated!")
            else:
                st.error(f"Key generation failed: {resp.get('error', 'Unknown')}")

    st.markdown('</div>', unsafe_allow_html=True)

    if st.session_state.rsa_public:
        st.markdown("""
        <div class="glass-card anim-fade-up">
            <div class="key-label"><span class="icon">🌐</span> Public Key</div>
        """, unsafe_allow_html=True)
        st.code(st.session_state.rsa_public, language=None)
        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card anim-fade-up anim-delay-1">
            <div class="key-label"><span class="icon">🔏</span> Private Key</div>
        """, unsafe_allow_html=True)
        st.code(st.session_state.rsa_private, language=None)
        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("""
        <div class="info-tip">
            <span class="icon">💡</span>
            <span>Copy the <strong>public key</strong> to encrypt and the <strong>private key</strong> to decrypt in the Encryption Dashboard.</span>
        </div>
        """, unsafe_allow_html=True)


# ════════════════════════════════════════════════════════════════
#  PAGE: Algorithms
# ════════════════════════════════════════════════════════════════
elif page == "Algorithms":
    st.markdown('<div class="page-title">Algorithm Explorer</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Explore all supported cryptographic algorithms organized by category.</div>', unsafe_allow_html=True)
    st.markdown('<hr class="colored-divider">', unsafe_allow_html=True)

    # Group by category
    categories = {}
    for algo in ALGORITHMS:
        cat = algo["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(algo)

    for cat_name, algos in categories.items():
        st.markdown(f"""
        <div class="section-header" style="margin-top: 12px;">
            <span class="algo-badge {CAT_BADGE[cat_name]}">{CAT_ICON[cat_name]} {cat_name.upper()}</span>
        </div>
        """, unsafe_allow_html=True)

        cols = st.columns(min(len(algos), 3), gap="medium")
        for idx, algo in enumerate(algos):
            with cols[idx % len(cols)]:
                st.markdown(f"""
                <div class="algo-card anim-fade-up anim-delay-{(idx % 3) + 1}">
                    <div class="algo-card-name">{algo['name']}</div>
                    <div class="algo-card-desc">{algo['desc']}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)


# ════════════════════════════════════════════════════════════════
#  PAGE: History
# ════════════════════════════════════════════════════════════════
elif page == "History":
    st.markdown('<div class="page-title">Operation History</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Review your recent encryption, decryption, and hashing operations.</div>', unsafe_allow_html=True)
    st.markdown('<hr class="colored-divider">', unsafe_allow_html=True)

    if not st.session_state.history:
        st.markdown("""
        <div class="empty-state">
            <div class="icon">📭</div>
            <div class="title">No operations yet</div>
            <div class="desc">Start encrypting, decrypting, or hashing to see your history here.</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        header_col1, header_col2 = st.columns([3, 1])
        with header_col2:
            if st.button("🗑️ Clear History", use_container_width=True):
                st.session_state.history = []
                st.rerun()

        OP_ICON = {"encrypt": "🔒", "decrypt": "🔓", "hash": "🧬"}
        OP_COLOR = {"encrypt": "encrypt", "decrypt": "decrypt", "hash": "hash"}

        for i, entry in enumerate(st.session_state.history):
            op = entry["operation"]
            st.markdown(f"""
            <div class="history-card {OP_COLOR.get(op, '')} anim-fade-up" style="animation-delay: {min(i * 0.05, 0.5)}s; opacity: 0;">
                <div class="op-label">{OP_ICON.get(op, '⚙️')} {entry['algorithm']} <span style="color: var(--text-muted); font-weight: 400;">·</span> <span style="text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px;">{op}</span></div>
                <div class="op-meta">🕐 {entry['time']}</div>
                <div class="op-flow">{entry['input']} → {entry['output']}</div>
            </div>
            """, unsafe_allow_html=True)