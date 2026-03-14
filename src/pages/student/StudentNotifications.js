import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../api';
import { PageHeader, Button, Badge, Spinner, Empty } from '../../components/common/UI';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_COLOR = {
  GENERAL:          'gray',
  PAYMENT_DUE:      'amber',
  COMPLAINT_UPDATE: 'blue',
  MAINTENANCE:      'rose',
  EMERGENCY:        'rose',
  MESS_UPDATE:      'teal',
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('ALL'); // ALL | UNREAD

  const load = () => {
    setLoading(true);
    notificationAPI.getMy()
      .then(r => setNotifications(r.data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const displayed = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed'); }
  };

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(ns => ns.filter(n => n.id !== id));
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spinner size="lg" /></div>;

  return (
    <div className="fade-up">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {['ALL','UNREAD'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '.82rem', fontWeight: 500,
                  background: filter === f ? 'var(--ink)' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--ink-mute)',
                  transition: 'all .15s',
                }}>
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAll} size="sm">Mark all read</Button>
            )}
          </div>
        }
      />

      {displayed.length === 0 ? (
        <Empty icon="◬" message={filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications yet.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayed.map(n => (
            <div
              key={n.id}
              style={{
                background: n.isRead ? 'var(--card)' : 'var(--amber-lt)',
                border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(232,160,32,.35)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                transition: 'background .2s',
              }}
            >
              {/* Unread dot */}
              <div style={{ paddingTop: 4, flexShrink: 0 }}>
                {!n.isRead && (
                  <span style={{ width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%', display: 'block' }} />
                )}
                {n.isRead && (
                  <span style={{ width: 8, height: 8, background: 'var(--border-strong)', borderRadius: '50%', display: 'block' }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{n.title}</span>
                  <Badge label={n.notificationType} color={TYPE_COLOR[n.notificationType] || 'gray'} />
                  {n.isGlobal && <Badge label="Broadcast" color="teal" />}
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--ink-soft)', marginBottom: 6, lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '.75rem', color: 'var(--ink-mute)' }}>
                  {formatDateTime(n.createdAt)}
                  {n.sentBy && ` · from ${n.sentBy}`}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {!n.isRead && (
                  <Button size="sm" variant="ghost" onClick={() => handleMarkRead(n.id)}>
                    ✓ Read
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => handleDelete(n.id)}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
