import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import './AppLayout.css';

const ADMIN_NAV = [
  { to: '/admin',              label: 'Dashboard',    icon: '⊞' },
  { to: '/admin/students',     label: 'Students',     icon: '◎' },
  { to: '/admin/wardens',      label: 'Wardens',      icon: '◈' },
  { to: '/admin/rooms',        label: 'Rooms',        icon: '⬜' },
  { to: '/admin/complaints',   label: 'Complaints',   icon: '◈' },
  { to: '/admin/payments',     label: 'Payments',     icon: '◇' },
  { to: '/admin/mess',         label: 'Mess Menu',    icon: '◉' },
  { to: '/admin/notifications',label: 'Notifications',icon: '◬' },
];

const WARDEN_NAV = [
  { to: '/admin',               label: 'Dashboard',    icon: '⊞' },
  { to: '/warden-profile',      label: 'My Profile',   icon: '◎' },
  { to: '/admin/students',      label: 'Students',     icon: '◎' },
  { to: '/admin/rooms',         label: 'Rooms',        icon: '⬜' },
  { to: '/admin/complaints',    label: 'Complaints',   icon: '◈' },
  { to: '/admin/payments',      label: 'Payments',     icon: '◇' },
  { to: '/admin/mess',          label: 'Mess Menu',    icon: '◉' },
  { to: '/admin/notifications', label: 'Notifications',icon: '◬' },
];

const STUDENT_NAV = [
  { to: '/student',               label: 'Dashboard',     icon: '⊞' },
  { to: '/student/profile',       label: 'My Profile',    icon: '◎' },
  { to: '/student/complaints',    label: 'Complaints',    icon: '◈' },
  { to: '/student/payments',      label: 'Payments',      icon: '◇' },
  { to: '/student/mess',          label: 'Mess Menu',     icon: '◉' },
  { to: '/student/notifications', label: 'Notifications', icon: '◬' },
];

export default function AppLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'student' ? STUDENT_NAV : (user?.role === 'WARDEN' ? WARDEN_NAV : ADMIN_NAV);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⌂</span>
          <span className="brand-text">HostelHub</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/student'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⎋</button>
        </div>
      </aside>

      {/* ── Overlay (mobile) ── */}
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

      {/* ── Main ── */}
      <div className="main-area">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="header-right">
            <NotificationBell />
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
