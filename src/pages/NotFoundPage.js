import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const home = user ? (user.role === 'STUDENT' ? '/student' : '/admin') : '/login';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', background: 'var(--surface)',
      padding: 40, textAlign: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: '7rem',
        color: 'var(--border-strong)', lineHeight: 1, marginBottom: 16,
      }}>
        404
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 8 }}>
        Page not found
      </h2>
      <p style={{ color: 'var(--ink-mute)', marginBottom: 28, maxWidth: 360 }}>
        The page you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <button
        onClick={() => navigate(home)}
        style={{
          padding: '10px 26px', background: 'var(--ink)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)', fontSize: '.95rem',
          cursor: 'pointer', fontWeight: 600,
          transition: 'background .15s',
        }}
        onMouseOver={e => e.target.style.background = 'var(--amber)'}
        onMouseOut={e => e.target.style.background  = 'var(--ink)'}
      >
        ← Back to Home
      </button>
    </div>
  );
}
