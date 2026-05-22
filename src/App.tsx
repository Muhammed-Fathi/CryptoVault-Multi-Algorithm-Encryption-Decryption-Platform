import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AlgorithmExplorer from './pages/AlgorithmExplorer';
import RSAKeyGenerator from './pages/RSAKeyGenerator';
import ApiDocs from './pages/ApiDocs';
import About from './pages/About';

/**
 * CryptoVault — Multi-Algorithm Encryption & Decryption Platform
 *
 * Entry point component that configures routing and layout.
 * Uses HashRouter for single-file SPA compatibility.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/algorithms" element={<AlgorithmExplorer />} />
          <Route path="/rsa-keys" element={<RSAKeyGenerator />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
