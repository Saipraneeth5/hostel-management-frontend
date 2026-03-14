import React, { useEffect, useState } from 'react';
import { complaintAPI } from '../../api';
import { PageHeader, Button, Badge, Table, Modal, Textarea, Select, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const STATUS_COLOR = { PENDING: 'amber', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'rose' };

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [resolveModal, setResolveModal] = useState(null);
  const [remarks, setRemarks]       = useState('');
  const [newStatus, setNewStatus]   = useState('RESOLVED');
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    complaintAPI.getAll()
      .then(r => setComplaints(r.data))
      .catch(() => toast.error('Failed to load complaints'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filterStatus === 'ALL' ? complaints : complaints.filter(c => c.status === filterStatus);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await complaintAPI.updateStatus(resolveModal.id, newStatus, remarks);
      toast.success('Complaint status updated');
      setResolveModal(null);
      setRemarks('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await complaintAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { key: 'id', label: '#', width: 50 },
    { key: 'student', label: 'Student', render: c => c.student ? `${c.student.firstName} ${c.student.lastName}` : '—' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: c => <Badge label={c.category} color="gray" /> },
    { key: 'priority', label: 'Priority', render: c => <Badge label={c.priority} color={c.priority === 'URGENT' ? 'rose' : c.priority === 'HIGH' ? 'amber' : 'gray'} /> },
    { key: 'status', label: 'Status', render: c => <Badge label={c.status} color={STATUS_COLOR[c.status] || 'gray'} /> },
    { key: 'createdAt', label: 'Date', render: c => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—' },
    { key: 'actions', label: '', render: c => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="outline" onClick={() => { setResolveModal(c); setNewStatus('RESOLVED'); setRemarks(c.adminRemarks || ''); }}>
          Manage
        </Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>✕</Button>
      </div>
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="Complaints"
        subtitle={`${complaints.length} total complaints`}
        action={
          <select className="mini-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All</option>
            {['PENDING','IN_PROGRESS','RESOLVED','REJECTED'].map(s => <option key={s}>{s}</option>)}
          </select>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : (
        <Table columns={columns} data={filtered} emptyMsg="No complaints found." />
      )}

      <Modal open={!!resolveModal} onClose={() => setResolveModal(null)} title="Manage Complaint" size="md">
        {resolveModal && (
          <div>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{resolveModal.title}</p>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-soft)', marginBottom: 8 }}>{resolveModal.description}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge label={resolveModal.category} color="gray" />
                <Badge label={resolveModal.priority} color="amber" />
              </div>
            </div>
            <div className="form-grid">
              <Select label="Update Status" value={newStatus} onChange={e => setNewStatus(e.target.value)} className="full">
                {['PENDING','IN_PROGRESS','RESOLVED','REJECTED'].map(s => <option key={s}>{s}</option>)}
              </Select>
              <Textarea label="Admin Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add notes or remarks…" className="full" />
              <div className="form-actions full">
                <Button variant="outline" onClick={() => setResolveModal(null)}>Cancel</Button>
                <Button variant="amber" loading={saving} onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>{`.mini-select{height:36px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.875rem;background:var(--card);cursor:pointer;outline:none;}.mini-select:focus{border-color:var(--amber);}`}</style>
    </div>
  );
}
