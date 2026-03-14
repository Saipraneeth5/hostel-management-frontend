import React, { useEffect, useState } from 'react';
import { roomAPI } from '../../api';
import { PageHeader, Button, Badge, Table, Modal, Input, Select, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const STATUS_COLOR = { AVAILABLE: 'green', FULL: 'rose', MAINTENANCE: 'amber', RESERVED: 'blue' };
const TYPE_COLOR   = { SINGLE: 'teal', DOUBLE: 'blue', TRIPLE: 'amber', DORMITORY: 'gray' };

const EMPTY_ROOM = { roomNumber: '', roomType: 'SINGLE', capacity: '', floor: '', block: '', monthlyFee: '', description: '', hasAc: false, hasAttachedBathroom: false };

export default function RoomsPage() {
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | { mode: 'create'|'edit', data }
  const [saving, setSaving]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const load = () => {
    setLoading(true);
    roomAPI.getAll()
      .then(r => setRooms(r.data))
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filterStatus === 'ALL' ? rooms : rooms.filter(r => r.status === filterStatus);

  const handleSave = async () => {
    const d = modal.data;
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await roomAPI.create({ ...d, capacity: parseInt(d.capacity), floor: parseInt(d.floor), monthlyFee: parseFloat(d.monthlyFee) });
        toast.success('Room created');
      } else {
        await roomAPI.update(d.id, { ...d, capacity: parseInt(d.capacity), floor: parseInt(d.floor), monthlyFee: parseFloat(d.monthlyFee) });
        toast.success('Room updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await roomAPI.updateStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomAPI.delete(id);
      toast.success('Room deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete occupied room');
    }
  };

  const setField = (k) => (e) => setModal(m => ({ ...m, data: { ...m.data, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }));

  const columns = [
    { key: 'roomNumber', label: 'Room No.',  width: 90 },
    { key: 'block',      label: 'Block',     width: 60, render: r => <Badge label={`Block ${r.block}`} color="gray" /> },
    { key: 'floor',      label: 'Floor',     width: 60 },
    { key: 'roomType',   label: 'Type',      render: r => <Badge label={r.roomType} color={TYPE_COLOR[r.roomType] || 'gray'} /> },
    { key: 'occupancy',  label: 'Occupancy', render: r => `${r.occupiedCount} / ${r.capacity}` },
    { key: 'monthlyFee', label: 'Fee/mo',    render: r => `₹${Number(r.monthlyFee).toLocaleString()}` },
    { key: 'amenities',  label: 'Amenities', render: r => (
      <div style={{ display: 'flex', gap: 4 }}>
        {r.hasAc && <Badge label="AC" color="teal" />}
        {r.hasAttachedBathroom && <Badge label="Bath" color="blue" />}
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={STATUS_COLOR[r.status] || 'gray'} /> },
    { key: 'actions', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="outline" onClick={() => setModal({ mode: 'edit', data: { ...r } })}>Edit</Button>
        <select
          className="mini-select"
          value={r.status}
          onChange={e => handleStatusChange(r.id, e.target.value)}
        >
          {['AVAILABLE','FULL','MAINTENANCE','RESERVED'].map(s => <option key={s}>{s}</option>)}
        </select>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>✕</Button>
      </div>
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} total rooms`}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="mini-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              {['AVAILABLE','FULL','MAINTENANCE','RESERVED'].map(s => <option key={s}>{s}</option>)}
            </select>
            <Button variant="amber" onClick={() => setModal({ mode: 'create', data: { ...EMPTY_ROOM } })}>+ Add Room</Button>
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : (
        <Table columns={columns} data={filtered} emptyMsg="No rooms found." />
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add New Room' : 'Edit Room'}
        size="md"
      >
        {modal && (
          <div className="form-grid">
            <Input label="Room Number *" value={modal.data.roomNumber} onChange={setField('roomNumber')} />
            <Select label="Type *" value={modal.data.roomType} onChange={setField('roomType')}>
              {['SINGLE','DOUBLE','TRIPLE','DORMITORY'].map(t => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Capacity *" type="number" value={modal.data.capacity} onChange={setField('capacity')} />
            <Input label="Monthly Fee (₹) *" type="number" value={modal.data.monthlyFee} onChange={setField('monthlyFee')} />
            <Input label="Floor" type="number" value={modal.data.floor} onChange={setField('floor')} />
            <Input label="Block" value={modal.data.block} onChange={setField('block')} placeholder="A, B, C…" />
            <Input label="Description" value={modal.data.description || ''} onChange={setField('description')} className="full" />
            <div style={{ display: 'flex', gap: 20 }} className="full">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={modal.data.hasAc} onChange={setField('hasAc')} />
                Has AC
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={modal.data.hasAttachedBathroom} onChange={setField('hasAttachedBathroom')} />
                Attached Bathroom
              </label>
            </div>
            <div className="form-actions full">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handleSave}>
                {modal.mode === 'create' ? 'Create Room' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`.mini-select{height:30px;padding:0 8px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.8rem;background:var(--card);cursor:pointer;outline:none;}.mini-select:focus{border-color:var(--amber);}`}</style>
    </div>
  );
}
