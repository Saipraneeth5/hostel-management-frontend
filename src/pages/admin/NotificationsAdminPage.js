import React, { useEffect, useState } from 'react';
import { notificationAPI, studentAPI } from '../../api';
import { PageHeader, Button, Badge, Table, Modal, Input, Select, Textarea, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TYPE_COLOR = { GENERAL: 'gray', PAYMENT_DUE: 'amber', COMPLAINT_UPDATE: 'blue', MAINTENANCE: 'rose', EMERGENCY: 'rose', MESS_UPDATE: 'teal' };

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // 'user' | 'global'
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ userId: '', title: '', message: '', type: 'GENERAL' });

  const load = () => {
    setLoading(true);
    notificationAPI.getAll()
      .then(r => setNotifications(r.data))
      // Change line 21:
      .catch((err) => {
        console.log('STATUS:', err.response?.status);
        console.log('BODY:', JSON.stringify(err.response?.data));
        toast.error('Failed');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    studentAPI.getAll().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const handleSend = async () => {
    setSaving(true);
    try {
      if (modal === 'global') {
        await notificationAPI.sendGlobal(form.title, form.message, form.type);
        toast.success('Global notification sent');
      } else {
        await notificationAPI.sendToUser(form.userId, form.title, form.message, form.type);
        toast.success('Notification sent');
      }
      setModal(null);
      setForm({ userId: '', title: '', message: '', type: 'GENERAL' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: n => <span style={{ color: 'var(--ink-soft)', fontSize: '.875rem' }}>{n.message.substring(0, 80)}{n.message.length > 80 ? '…' : ''}</span> },
    { key: 'type', label: 'Type', render: n => <Badge label={n.notificationType} color={TYPE_COLOR[n.notificationType] || 'gray'} /> },
    { key: 'scope', label: 'Scope', render: n => n.isGlobal ? <Badge label="Global" color="teal" /> : <Badge label="Individual" color="blue" /> },
    { key: 'sentBy', label: 'Sent By', render: n => n.sentBy || '—' },
    { key: 'createdAt', label: 'Date', render: n => n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '—' },
    { key: 'actions', label: '', render: n => (
      <Button size="sm" variant="danger" onClick={() => handleDelete(n.id)}>✕</Button>
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="Notifications"
        subtitle="Send and manage notifications"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setModal('user')}>Send to Student</Button>
            <Button variant="amber" onClick={() => setModal('global')}>Send to All</Button>
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : (
        <Table columns={columns} data={notifications} emptyMsg="No notifications yet." />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'global' ? 'Send Global Notification' : 'Send to Student'} size="md">
        <div className="form-grid">
          {modal === 'user' && (
            <Select label="Student *" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} className="full">
              <option value="">Select student…</option>
              {students.map(s => (
                <option key={s.user?.id} value={s.user?.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
              ))}
            </Select>
          )}
          <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="full" />
          <Textarea label="Message *" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="full" />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {['GENERAL','PAYMENT_DUE','COMPLAINT_UPDATE','MAINTENANCE','EMERGENCY','MESS_UPDATE'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <div className="form-actions full">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleSend}>Send</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
