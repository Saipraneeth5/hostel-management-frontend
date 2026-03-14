import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', padding: 40, textAlign: 'center',
        }}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>⚠</span>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: 'var(--ink-mute)', marginBottom: 24, maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '9px 22px', background: 'var(--ink)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)', fontSize: '.9rem',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
