# CryptoVault — Multi-Algorithm Encryption & Decryption Platform

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> **Enterprise-grade cybersecurity platform** supporting 10+ cryptographic algorithms across classical ciphers, modern encryption, and cryptographic hashing.

---

## Platform Preview

A production-ready multi-frontend cybersecurity SaaS platform with a shared FastAPI backend, React enterprise web client, and Streamlit desktop client.

---

## Architecture

```
                    ┌───────────────────────┐
                    │   FastAPI Backend     │
                    │  (Python 3.12+)       │
                    │                       │
                    │  • REST API           │
                    │  • All algorithms     │
                    │  • Pydantic models    │
                    │  • OpenAPI docs       │
                    └──────┬───────┬────────┘
                           │       │
                    ┌──────┘       └───────┐
                    │                      │
          ┌─────────┴───────┐    ┌─────────┴────────┐
          │  React Client   │    │  Streamlit App   │
          │  (TypeScript)   │    │  (Python)        │
          │                 │    │                  │
          │  • Tailwind CSS │    │  • Custom CSS    │
          │  • Framer Motion│    │  • Glassmorphism │
          │  • Zustand      │    │  • Session state │
          │  • React Router │    │  • API consumer  │
          └─────────────────┘    └──────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **FastAPI as sole crypto layer** | Single source of truth, no algorithm duplication |
| **Dual frontend architecture** | Maximum flexibility (web + desktop) |
| **Offline fallback in React** | Full functionality without backend |
| **Modular algorithm registry** | Easy to add new algorithms |
| **Pydantic validation** | Type-safe API contracts |

---

## Supported Algorithms

### Classical Ciphers
| Algorithm | Type | Key Requirement | Security |
|-----------|------|-----------------|----------|
| **Vigenère Cipher** | Polyalphabetic substitution | Alphabetic keyword | 🔴 Low |
| **Vernam Cipher (OTP)** | XOR one-time pad | ≥ plaintext length | 🟢 Perfect Secrecy* |
| **Playfair Cipher** | Digraph substitution | Alphabetic keyword | 🔴 Low |

### Modern Encryption
| Algorithm | Type | Key Requirement | Security |
|-----------|------|-----------------|----------|
| **DES** | 56-bit Feistel block cipher | 8+ characters | 🔴 Low (legacy) |
| **AES-256** | Rijndael block cipher | 16+ characters (SHA-256 derived) | 🟢 Very High |
| **RC4** | Stream cipher | Variable length | 🔴 Low (broken) |
| **RSA** | Asymmetric public-key | Generated key pair | 🟢 Very High |

### Cryptographic Hashing
| Algorithm | Output | Security |
|-----------|--------|----------|
| **MD5** | 128-bit (32 hex chars) | 🔴 Broken |
| **SHA-1** | 160-bit (40 hex chars) | 🔴 Broken |
| **SHA-256** | 256-bit (64 hex chars) | 🟢 Very High |

> *Vernam achieves perfect secrecy only with truly random keys used exactly once.

### Implementation Method

| Algorithm | Implementation | Library |
|-----------|---------------|---------|
| Vigenère | From scratch | — |
| Vernam | From scratch | — |
| Playfair | From scratch | — |
| RC4 | From scratch | — |
| RSA | From scratch (Miller-Rabin, Extended GCD) | — |
| MD5 | From scratch (RFC 1321) | — |
| SHA-1 | From scratch (FIPS 180-4) | — |
| SHA-256 | From scratch (FIPS 180-4) | — |
| DES | CBC mode, proper padding | PyCryptodome |
| AES | AES-256-CBC, SHA-256 key derivation | PyCryptodome / Web Crypto API |

---

## Features

- **Encrypt/Decrypt** with 7+ algorithms
- **Hash** with MD5, SHA-1, SHA-256
- **RSA Key Generation** (2048/3072/4096-bit)
- **Algorithm Explorer** with educational content
- **Copy/Download** results
- **Operation History**
- **REST API** with OpenAPI/Swagger docs
- **Glassmorphism UI** with dark theme
- **Responsive design** for all screen sizes
- **Real-time validation** and error handling
- **Toast notifications**

---

## Quick Start

### Prerequisites
- **Python** 3.12+
- **Node.js** 18+
- **npm** 9+

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### 2. React Frontend

```bash
npm install
npm run dev
```

App available at `http://localhost:5173`

### 3. Streamlit Client

```bash
pip install streamlit requests
cd streamlit_app
streamlit run app.py
```

App available at `http://localhost:8501`

---

## API Reference

### `GET /health`
Health check endpoint.

### `GET /algorithms`
List all supported algorithms with metadata.

### `POST /encrypt`
```json
{ "text": "Hello, World!", "algorithm": "aes", "key": "my-secret-key" }
```

### `POST /decrypt`
```json
{ "text": "U2FsdGVkX1...", "algorithm": "aes", "key": "my-secret-key" }
```

### `POST /hash`
```json
{ "text": "Hello, World!", "algorithm": "sha256" }
```

### `POST /generate-rsa-keys`
```json
{ "key_size": 2048 }
```

> Full interactive documentation available at `/docs` (Swagger UI) when the backend is running.

---

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application with all algorithms
│   └── requirements.txt     # Python dependencies
├── streamlit_app/
│   └── app.py               # Streamlit desktop client
├── src/
│   ├── App.tsx              # React entry point with routing
│   ├── main.tsx             # Vite entry
│   ├── index.css            # Global styles + Tailwind
│   ├── components/
│   │   └── Layout.tsx       # Nav, notifications, layout
│   ├── pages/
│   │   ├── LandingPage.tsx  # Hero, features, CTA
│   │   ├── Dashboard.tsx    # Main encryption interface
│   │   ├── AlgorithmExplorer.tsx  # Algorithm cards
│   │   ├── RSAKeyGenerator.tsx    # RSA key management
│   │   ├── ApiDocs.tsx      # API documentation
│   │   └── About.tsx        # Cryptography education
│   ├── crypto/
│   │   ├── classical.ts     # Vigenère, Vernam, Playfair
│   │   ├── modern.ts        # RC4, DES, AES, RSA
│   │   ├── hashing.ts       # MD5, SHA-1, SHA-256
│   │   └── index.ts         # Algorithm registry
│   ├── services/
│   │   └── api.ts           # API service with offline fallback
│   ├── store/
│   │   └── useStore.ts      # Zustand state management
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── tests/
│   └── test_algorithms.py   # Algorithm correctness tests
├── index.html               # HTML entry point
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

---

## Testing

```bash
# Run Python tests
cd backend
pip install pytest
python -m pytest ../tests/ -v

# Run React build to verify frontend
npm run build
```

---

## Security Considerations

- All inputs are validated with Pydantic models
- AES uses SHA-256 key derivation and random IV per encryption
- DES uses CBC mode with PKCS7 padding
- RSA uses proper modular exponentiation
- Hashing algorithms produce cryptographically correct digests
- Error messages are sanitized to prevent information leakage
- Keys are never logged or stored persistently

> **Disclaimer**: This is an educational/portfolio project. For production use, always use established libraries (libsodium, OpenSSL) and follow industry best practices.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, FastAPI, Pydantic, Uvicorn |
| **Crypto (Python)** | PyCryptodome (AES/DES), from-scratch (rest) |
| **React Client** | React 19, TypeScript, Tailwind CSS 4 |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **HTTP Client** | Axios |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Build Tool** | Vite |
| **Streamlit Client** | Streamlit, Requests |
| **Testing** | pytest |

---

## Author

Built as a portfolio project demonstrating:
- Full-stack architecture design
- Clean code principles (SOLID, Separation of Concerns)
- Cryptographic algorithm implementation
- Multi-frontend architecture (React + Streamlit)
- Enterprise-grade UI/UX design
- API-first design with OpenAPI documentation

---

## License

MIT License — Free for educational and portfolio use.
