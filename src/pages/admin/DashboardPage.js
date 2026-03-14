import React, { useEffect, useState } from 'react';
import { studentAPI, roomAPI, complaintAPI, paymentAPI } from '../../api';
import { StatCard, Card } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Dashboard.css';

const PIE_COLORS = ['#16a34a', '#e11d48'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]   = useState({ students: {}, rooms: {}, payments: {} });
  const [pending, setPending] = useState({ complaints: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentAPI.getStats(),
      roomAPI.getStats(),
      paymentAPI.getStats(),
      complaintAPI.getPendingCount(),
    ]).then(([s, r, p, c]) => {
      setStats({ students: s.data, rooms: r.data, payments: p.data });
      setPending({ complaints: c.data.pendingComplaints, payments: p.data.pendingPayments });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const paymentChartData = [
    { name: 'Collected', value: Number(stats.payments.totalCollected ?? 0) },
    { name: 'Pending',   value: Number(stats.payments.totalPending   ?? 0) },
  ];

  const roomChartData = [
    { name: 'Total',     Rooms: stats.rooms.totalRooms        ?? 0 },
    { name: 'Available', Rooms: stats.rooms.availableRooms    ?? 0 },
    { name: 'Slots',     Rooms: stats.rooms.totalAvailableSlots ?? 0 },
  ];

  const summaryCards = [
    { label: 'Total Students',    value: stats.students.totalStudents,     icon: '◎', color: 'amber' },
    { label: 'Active Students',   value: stats.students.activeStudents,    icon: '◉', color: 'green' },
    { label: 'Available Rooms',   value: stats.rooms.availableRooms,       icon: '⬜', color: 'teal'  },
    { label: 'Pending Complaints',value: pending.complaints,               icon: '◈', color: 'rose'  },
    { label: 'Pending Payments',  value: pending.payments,                 icon: '◇', color: pending.payments > 0 ? 'rose' : 'green' },
    { label: 'Open Slots',        value: stats.rooms.totalAvailableSlots,  icon: '⊞', color: 'blue'  },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '.82rem' }}>
          <strong>{payload[0].name}</strong>: {formatCurrency(payload[0].value)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard fade-up">
      <div className="dashboard-welcome">
        <h1>Good to see you, <em>{user?.username}</em> 👋</h1>
        <p>Here's a snapshot of the hostel today.</p>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="stat-skeleton" />)}
        </div>
      ) : (
        <div className="stats-grid">
          {summaryCards.map((c, i) => (
            <div key={c.label} style={{ animationDelay: `${i * 0.06}s` }} className="fade-up">
              <StatCard {...c} />
            </div>
          ))}
        </div>
      )}

      <div className="charts-row">
        <Card className="chart-card">
          <h3 className="chart-title">Payment Summary</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={paymentChartData}
                cx="50%" cy="50%"
                innerRadius={58} outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentChartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) => (
                  <span style={{ fontSize: '.8rem', color: 'var(--ink-soft)' }}>
                    {value}: <strong>{formatCurrency(entry.payload.value)}</strong>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <h3 className="chart-title">Room Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roomChartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(232,160,32,.08)' }} />
              <Bar dataKey="Rooms" fill="var(--amber)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick info strip */}
      <div className="quick-strip">
        <div className="quick-item">
          <span className="quick-icon">◈</span>
          <span><strong>{pending.complaints}</strong> complaint{pending.complaints !== 1 ? 's' : ''} awaiting action</span>
        </div>
        <div className="quick-item">
          <span className="quick-icon">◇</span>
          <span><strong>{formatCurrency(stats.payments.totalCollected)}</strong> collected so far</span>
        </div>
        <div className="quick-item">
          <span className="quick-icon">◉</span>
          <span><strong>{stats.rooms.totalAvailableSlots ?? 0}</strong> bed slots available</span>
        </div>
      </div>
    </div>
  );
}
