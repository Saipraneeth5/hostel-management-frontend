import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'STUDENT',
    firstName: '', lastName: '', phoneNumber: '', course: '', branch: '', year: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, year: form.year ? parseInt(form.year) : undefined });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-icon">⌂</span>
          <span className="auth-brand-name">HostelHub</span>
        </div>
        <div className="auth-tagline">
          <h1>Join the<br /><em>community.</em></h1>
          <p>Create your account to access rooms, complaints, payments and more.</p>
        </div>
        <div className="auth-dots"><span /><span /><span /></div>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <div className="auth-fields">
            <div className="auth-field-row">
              <div className="auth-field">
                <label>Username *</label>
                <input value={form.username} onChange={set('username')} placeholder="username" required />
              </div>
              <div className="auth-field">
                <label>Role *</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="WARDEN">Warden</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>

            <div className="auth-field">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} />
            </div>

            {form.role === 'STUDENT' && (
              <>
                <p className="auth-section-title">Student Details</p>
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label>First Name</label>
                    <input value={form.firstName} onChange={set('firstName')} placeholder="First name" />
                  </div>
                  <div className="auth-field">
                    <label>Last Name</label>
                    <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" />
                  </div>
                </div>
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label>Phone</label>
                    <input value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 98765 43210" />
                  </div>
                  <div className="auth-field">
                    <label>Year</label>
                    <input type="number" value={form.year} onChange={set('year')} placeholder="1–4" min={1} max={4} />
                  </div>
                </div>
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label>Course</label>
                    <input value={form.course} onChange={set('course')} placeholder="B.Tech" />
                  </div>
                  <div className="auth-field">
                    <label>Branch</label>
                    <input value={form.branch} onChange={set('branch')} placeholder="CSE" />
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create account →'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
