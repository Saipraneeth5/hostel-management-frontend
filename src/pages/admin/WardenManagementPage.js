import React, { useEffect, useState, useCallback } from 'react';
import { wardenAPI, adminUserAPI } from '../../api';
import {
  PageHeader, Button, Badge, Table, Modal,
  Input, Select, Spinner, Empty,
} from '../../components/common/UI';
import toast from 'react-hot-toast';

const EMPTY_ADD = {
  username: '', email: '', password: '',
  firstName: '', lastName: '', wardenId: '', phoneNumber: '',
  dateOfBirth: '', assignedBlock: '', qualification: '',
  address: '', city: '', state: '',
};

export default function WardenManagementPage() {
  const [wardens, setWardens]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addModal, setAddModal]     = useState(false);
  const [addForm, setAddForm]       = useState(EMPTY_ADD);
  const [adding, setAdding]         = useState(false);
  const [editModal, setEditModal]   = useState(null);
  const [saving, setSaving]         = useState(false);

  const loadWardens = useCallback(() => {
    setLoading(true);
    wardenAPI.getAll()
      .then(r => setWardens(r.data))
      .catch(() => toast.error('Failed to load wardens'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadWardens(); }, [loadWardens]);

  const openAdd = () => { setAddForm(EMPTY_ADD); setAddModal(true); };
  const setAddField  = k => e => setAddForm(f  => ({ ...f,  [k]: e.target.value }));
  const setEditField = k => e => setEditModal(m => ({ ...m, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!addForm.username || !addForm.email || !addForm.password) {
      toast.error('Username, email and password are required'); return;
    }
    if (!addForm.firstName || !addForm.lastName) {
      toast.error('First name and last name are required'); return;
    }
    setAdding(true);
    try {
      const { data } = await adminUserAPI.createWarden(addForm);
      toast.success(`Warden created! Username: ${data.username} · ID: ${data.wardenCode}`);
      setAddModal(false);
      loadWardens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create warden');
    } finally { setAdding(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await wardenAPI.update(editModal.id, editModal);
      toast.success('Warden updated');
      setEditModal(null);
      loadWardens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete warden ${name}? This cannot be undone.`)) return;
    try {
      await wardenAPI.delete(id);
      toast.success('Warden deleted');
      loadWardens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'wardenId', label: 'ID', width: 100 },
    { key: 'name', label: 'Name', render: w => (
      <div>
        <span style={{ fontWeight: 500 }}>{w.firstName} {w.lastName}</span>
        <span style={{ display: 'block', fontSize: '.75rem', color: 'var(--ink-mute)' }}>{w.email}</span>
      </div>
    )},
    { key: 'phone',  label: 'Phone',   render: w => w.phoneNumber || '—' },
    { key: 'block',  label: 'Block',   render: w => w.assignedBlock
      ? <Badge label={`Block ${w.assignedBlock}`} color="teal" />
      : <span style={{ color: 'var(--ink-mute)', fontSize: '.82rem' }}>Unassigned</span>
    },
    { key: 'qual',   label: 'Qualification', render: w => w.qualification || '—' },
    { key: 'status', label: 'Status',  render: w => (
      <Badge label={w.status} color={w.status === 'ACTIVE' ? 'green' : 'gray'} />
    )},
    { key: 'actions', label: '', render: w => (
      <div style={{ display: 'flex', gap: 5 }}>
        <Button size="sm" variant="outline" onClick={() => setEditModal({ ...w })}>Edit</Button>
        <Button size="sm" variant="danger"  onClick={() => handleDelete(w.id, `${w.firstName} ${w.lastName}`)}>✕</Button>
      </div>
    )},
  ];

  const noteStyle = {
    padding: '8px 12px', background: 'var(--surface)', borderRadius: 6,
    fontSize: '.8rem', color: 'var(--ink-soft)', borderLeft: '3px solid var(--amber)', marginBottom: 4,
  };
  const lockedStyle = { opacity: 0.6, cursor: 'not-allowed' };

  return (
    <div className="fade-up">
      <PageHeader
        title="Wardens"
        subtitle={`${wardens.length} registered`}
        action={<Button variant="amber" onClick={openAdd}>+ Add Warden</Button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : wardens.length === 0 ? (
        <Empty icon="◈" message="No wardens yet. Add one to get started." />
      ) : (
        <Table columns={columns} data={wardens} />
      )}

      {/* ── Add Warden Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Warden" size="lg">
        <div className="form-grid">
          <div className="full" style={noteStyle}>
            These credentials will be shared with the warden to log in. They cannot be changed by the warden later.
          </div>
          <Input label="Username *"      value={addForm.username}      onChange={setAddField('username')}      placeholder="e.g. warden_a" />
          <Input label="Email *"         value={addForm.email}         onChange={setAddField('email')}         type="email" placeholder="warden@hostel.com" />
          <Input label="Password *"      value={addForm.password}      onChange={setAddField('password')}      type="password" placeholder="Min. 6 characters" />
          <Input label="Warden ID"       value={addForm.wardenId}      onChange={setAddField('wardenId')}      placeholder="Auto-generated if blank" />
          <Input label="First Name *"    value={addForm.firstName}     onChange={setAddField('firstName')} />
          <Input label="Last Name *"     value={addForm.lastName}      onChange={setAddField('lastName')} />
          <Input label="Phone"           value={addForm.phoneNumber}   onChange={setAddField('phoneNumber')} />
          <Input label="Date of Birth"   value={addForm.dateOfBirth}   onChange={setAddField('dateOfBirth')}   type="date" />
          <Input label="Assigned Block"  value={addForm.assignedBlock} onChange={setAddField('assignedBlock')} placeholder="e.g. A, B, C" />
          <Input label="Qualification"   value={addForm.qualification} onChange={setAddField('qualification')} placeholder="e.g. M.Sc, B.Ed" />
          <Input label="City"            value={addForm.city}          onChange={setAddField('city')} />
          <Input label="State"           value={addForm.state}         onChange={setAddField('state')} />
          <Input label="Address"         value={addForm.address}       onChange={setAddField('address')}       className="full" />
          <div className="form-actions full">
            <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button variant="amber" loading={adding} onClick={handleAdd}>Create Warden</Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Warden Modal ── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Warden" size="lg">
        {editModal && (
          <div className="form-grid">
            <div className="full" style={{ ...noteStyle, borderLeftColor: 'var(--border)' }}>
              Username and email are admin-controlled and cannot be edited here.
            </div>
            <div className="field">
              <label className="field-label">Username (locked)</label>
              <input className="field-input" value={editModal.user?.username || '—'} disabled style={lockedStyle} />
            </div>
            <div className="field">
              <label className="field-label">Email (locked)</label>
              <input className="field-input" value={editModal.email || '—'} disabled style={lockedStyle} />
            </div>
            <Input label="First Name"     value={editModal.firstName     || ''} onChange={setEditField('firstName')} />
            <Input label="Last Name"      value={editModal.lastName      || ''} onChange={setEditField('lastName')} />
            <Input label="Phone"          value={editModal.phoneNumber   || ''} onChange={setEditField('phoneNumber')} />
            <Input label="Date of Birth"  value={editModal.dateOfBirth   || ''} onChange={setEditField('dateOfBirth')}  type="date" />
            <Input label="Assigned Block" value={editModal.assignedBlock || ''} onChange={setEditField('assignedBlock')} placeholder="e.g. A, B, C" />
            <Input label="Qualification"  value={editModal.qualification || ''} onChange={setEditField('qualification')} />
            <Select label="Status"        value={editModal.status        || 'ACTIVE'} onChange={setEditField('status')}>
              {['ACTIVE','INACTIVE'].map(s => <option key={s}>{s}</option>)}
            </Select>
            <Input label="City"    value={editModal.city    || ''} onChange={setEditField('city')} />
            <Input label="State"   value={editModal.state   || ''} onChange={setEditField('state')} />
            <Input label="Address" value={editModal.address || ''} onChange={setEditField('address')} className="full" />
            <div className="form-actions full">
              <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
