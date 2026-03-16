import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const DEMO_CREDENTIALS = [
  { role: 'Admin',   username: 'admin',  password: 'admin123' },
  { role: 'Warden',  username: 'warden', password: 'warden123' },
  { role: 'Student', username: 'student', password: 'student123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.username}!`);
      navigate(data.role === 'STUDENT' ? '/student' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (username, password) => {
    setForm({ username, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-icon">⌂</span>
          <span className="auth-brand-name">HostelHub</span>
        </div>
        <div className="auth-tagline">
          <h1>Manage your hostel,<br /><em>effortlessly.</em></h1>
          <p>Rooms, complaints, payments, and mess — all in one place.</p>
        </div>

        <div className="auth-demo">
          <p className="auth-demo-title">Demo Credentials</p>
          {DEMO_CREDENTIALS.map(({ role, username, password }) => (
            <button
              key={role}
              type="button"
              className="auth-demo-btn"
              onClick={() => fillCredentials(username, password)}
            >
              <span className="auth-demo-role">{role}</span>
              <span className="auth-demo-user">{username} / {password}</span>
            </button>
          ))}
        </div>

        <div className="auth-dots">
          <span /><span /><span />
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to continue</p>
          </div>
          <div className="auth-fields">
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  );
}