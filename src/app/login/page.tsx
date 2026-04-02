'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      window.location.href = '/'; // Hard reload to clear middleware caches
    } else {
      const data = await res.json();
      setError(data.error || 'Authentication Failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>MAK Enterprises</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Secure Employee Login Portal</p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Corporate Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Password / Access Key</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
        </div>

        <button type="submit" style={{ padding: '0.875rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
          Authenticate Session
        </button>
      </form>
    </div>
  );
}
