import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetch = () => {
      notificationAPI.getUnreadCount()
        .then(r => setCount(r.data.unreadCount || 0))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const goToNotifications = () => {
    const path = user?.role === 'STUDENT' ? '/student/notifications' : '/admin/notifications';
    navigate(path);
  };

  return (
    <button className="bell-btn" onClick={goToNotifications} title="Notifications">
      <span className="bell-icon">◬</span>
      {count > 0 && <span className="bell-badge">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}
