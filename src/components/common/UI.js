import React from 'react';
import './UI.css';

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'amber', trend }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-value">{value ?? '—'}</span>
        <span className="stat-label">{label}</span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'gray' }) {
  return <span className={`badge badge--${color}`}>{label}</span>;
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? 'field-input--error' : ''}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className={`field-input ${error ? 'field-input--error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className={`field-input field-textarea ${error ? 'field-input--error' : ''}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal modal--${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, emptyMsg = 'No data found.' }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="table-empty">{emptyMsg}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  return <span className={`spinner spinner--${size}`} />;
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ icon = '◎', message }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p className="empty-msg">{message}</p>
    </div>
  );
}
