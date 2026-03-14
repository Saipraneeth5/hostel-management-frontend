import React, { useEffect, useState } from 'react';
import { studentAPI, paymentAPI, complaintAPI, notificationAPI } from '../../api';
import { StatCard, Card, Badge, Spinner } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, statusColor } from '../../utils/helpers';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user }  = useAuth();
  const [profile, setProfile]     = useState(null);
  const [payments, setPayments]   = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [unread, setUnread]       = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      studentAPI.getMe(),
      paymentAPI.getMy(),
      complaintAPI.getMy(),
      notificationAPI.getUnreadCount(),
    ]).then(([p, pay, c, n]) => {
      setProfile(p.data);
      setPayments(pay.data);
      setComplaints(c.data);
      setUnread(n.data.unreadCount || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spinner size="lg" />
    </div>
  );

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const openComplaints  = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
  const totalDue        = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="student-dash fade-up">
      <div className="student-welcome">
        <h1>Hello, <em>{profile?.firstName || user?.username}</em> 👋</h1>
        <p>Here's your hostel summary for today.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="My Room"
          value={profile?.room?.roomNumber || 'Unassigned'}
          icon="⬜" color={profile?.room ? 'teal' : 'gray'}
        />
        <StatCard
          label="Amount Due"
          value={totalDue > 0 ? formatCurrency(totalDue) : '₹0'}
          icon="◇" color={totalDue > 0 ? 'rose' : 'green'}
        />
        <StatCard
          label="Open Complaints"
          value={openComplaints.length}
          icon="◈" color={openComplaints.length > 0 ? 'amber' : 'green'}
        />
        <StatCard
          label="Unread Notifications"
          value={unread}
          icon="◬" color={unread > 0 ? 'blue' : 'green'}
        />
      </div>

      <div className="student-cards">
        {/* Profile summary */}
        <Card className="profile-summary-card">
          <h3 style={{ marginBottom: 14 }}>My Profile</h3>
          {profile ? (
            <div className="profile-rows">
              <ProfileRow label="Student ID"  value={profile.studentId} />
              <ProfileRow label="Email"       value={profile.email} />
              <ProfileRow label="Phone"       value={profile.phoneNumber || '—'} />
              <ProfileRow label="Course"      value={profile.course ? `${profile.course} — ${profile.branch}` : '—'} />
              <ProfileRow label="Year"        value={profile.year ? `Year ${profile.year}` : '—'} />
              <ProfileRow label="Room"        value={profile.room
                ? `${profile.room.roomNumber} · Block ${profile.room.block} · Floor ${profile.room.floor}`
                : 'Not assigned — contact warden'
              } />
              {profile.room && (
                <ProfileRow label="Monthly Fee" value={formatCurrency(profile.room.monthlyFee)} />
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-mute)', fontSize: '.875rem' }}>No profile found. Contact admin.</p>
          )}
        </Card>

        {/* Recent Payments */}
        <Card>
          <h3 style={{ marginBottom: 14 }}>Recent Payments</h3>
          {payments.length === 0 ? (
            <p style={{ color: 'var(--ink-mute)', fontSize: '.875rem' }}>No payment records yet.</p>
          ) : (
            <div className="recent-list">
              {payments.slice(0, 6).map(p => (
                <div key={p.id} className="recent-item">
                  <div>
                    <span className="recent-label">{p.paymentType?.replace(/_/g, ' ')}</span>
                    <span className="recent-sub">{p.forMonth || formatDate(p.createdAt)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="recent-amount">{formatCurrency(p.amount)}</span>
                    <Badge label={p.status} color={statusColor[p.status] || 'gray'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Complaints */}
        <Card>
          <h3 style={{ marginBottom: 14 }}>Recent Complaints</h3>
          {complaints.length === 0 ? (
            <p style={{ color: 'var(--ink-mute)', fontSize: '.875rem' }}>No complaints filed yet.</p>
          ) : (
            <div className="recent-list">
              {complaints.slice(0, 6).map(c => (
                <div key={c.id} className="recent-item">
                  <div>
                    <span className="recent-label">{c.title}</span>
                    <span className="recent-sub">{c.category} · {formatDate(c.createdAt)}</span>
                  </div>
                  <Badge label={c.status} color={statusColor[c.status] || 'gray'} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span className="profile-row-label">{label}</span>
      <span className="profile-row-value">{value}</span>
    </div>
  );
}
