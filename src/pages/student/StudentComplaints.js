import React, { useEffect, useState } from 'react';
import { complaintAPI } from '../../api';
import { PageHeader, Button, Badge, Table, Modal, Input, Select, Textarea, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const STATUS_COLOR = { PENDING: 'amber', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'rose' };

const EMPTY = { title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM' };

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    complaintAPI.getMy()
      .then(r => setComplaints(r.data))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await complaintAPI.create(modal.data);
        toast.success('Complaint filed successfully');
      } else {
        await complaintAPI.update(modal.data.id, modal.data);
        toast.success('Complaint updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const setField = k => e => setModal(m => ({ ...m, data: { ...m.data, [k]: e.target.value } }));

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: c => <Badge label={c.category} color="gray" /> },
    { key: 'priority', label: 'Priority', render: c => <Badge label={c.priority} color={c.priority === 'URGENT' ? 'rose' : c.priority === 'HIGH' ? 'amber' : 'gray'} /> },
    { key: 'status', label: 'Status', render: c => <Badge label={c.status} color={STATUS_COLOR[c.status] || 'gray'} /> },
    { key: 'adminRemarks', label: 'Remarks', render: c => c.adminRemarks ? <span style={{ fontSize: '.82rem', color: 'var(--ink-soft)' }}>{c.adminRemarks.substring(0, 60)}</span> : '—' },
    { key: 'createdAt', label: 'Filed', render: c => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—' },
    { key: 'actions', label: '', render: c => (
      c.status === 'PENDING'
        ? <Button size="sm" variant="outline" onClick={() => setModal({ mode: 'edit', data: { ...c } })}>Edit</Button>
        : null
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="My Complaints"
        subtitle="Track and manage your complaints"
        action={<Button variant="amber" onClick={() => setModal({ mode: 'create', data: { ...EMPTY } })}>+ New Complaint</Button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : (
        <Table columns={columns} data={complaints} emptyMsg="No complaints filed yet." />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'File a Complaint' : 'Edit Complaint'} size="md">
        {modal && (
          <div className="form-grid">
            <Input label="Title *" value={modal.data.title} onChange={setField('title')} className="full" />
            <Select label="Category *" value={modal.data.category} onChange={setField('category')}>
              {['MAINTENANCE','CLEANLINESS','FOOD','ELECTRICITY','WATER','INTERNET','SECURITY','OTHER'].map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Priority" value={modal.data.priority} onChange={setField('priority')}>
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
            </Select>
            <Textarea label="Description *" value={modal.data.description} onChange={setField('description')} className="full" rows={4} />
            <div className="form-actions full">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handleSave}>
                {modal.mode === 'create' ? 'Submit Complaint' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
