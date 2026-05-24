import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

const API_BASE = 'https://api.ainative.studio/api/v1';

function useAuth() {
  const token = localStorage.getItem('ainative_token');
  return { isAuthenticated: !!token, token };
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('ainative_token', data.access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">GeneratedApp</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input data-testid="email-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <input data-testid="password-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button data-testid="login-button" type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const logout = () => { localStorage.clear(); window.location.href = '/login'; };
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <span className="font-bold text-xl">GeneratedApp</span>
      <div className="flex items-center gap-2">
            <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-blue-700">Dashboard</Link>
            <Link to="/admin-panel" className="px-3 py-2 rounded hover:bg-blue-700">Admin Panel</Link>
        <button onClick={logout} className="ml-4 px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm">Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Nav />
                <main className="max-w-7xl mx-auto p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin-panel" element={<AdminPanel />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AINativeProvider>
  );
}