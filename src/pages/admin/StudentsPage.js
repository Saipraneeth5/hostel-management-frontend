import React, { useEffect, useState, useCallback } from 'react';
import { studentAPI, roomAPI, adminUserAPI } from '../../api';
import {
  PageHeader, Button, Badge, Table, Modal,
  Input, Select, Spinner, Empty,
} from '../../components/common/UI';
import { statusColor, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_ADD = {
  username: '', email: '', password: '',
  firstName: '', lastName: '', studentId: '', phoneNumber: '',
  parentName: '', parentPhone: '', dateOfBirth: '',
  course: '', branch: '', year: '',
  address: '', city: '', state: '',
  roomId: '',
};

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const [students, setStudents]     = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [addModal, setAddModal]     = useState(false);
  const [addForm, setAddForm]       = useState(EMPTY_ADD);
  const [addStep, setAddStep]       = useState(1);
  const [adding, setAdding]         = useState(false);
  const [editModal, setEditModal]   = useState(null);
  const [roomModal, setRoomModal]   = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [saving, setSaving]         = useState(false);

  const loadStudents = useCallback(() => {
    setLoading(true);
    studentAPI.getAll()
      .then(r => setStudents(r.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const loadRooms = useCallback(() => {
    roomAPI.getAvailable().then(r => setRooms(r.data)).catch(() => {});
  }, []);

  useEffect(() => { loadStudents(); loadRooms(); }, [loadStudents, loadRooms]);

  const filtered = students.filter(s => {
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openAdd = () => { setAddForm(EMPTY_ADD); setAddStep(1); setAddModal(true); };
  const setAddField = k => e => setAddForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!addForm.username || !addForm.email || !addForm.password) {
      toast.error('Username, email and password are required'); return;
    }
    if (!addForm.firstName || !addForm.lastName) {
      toast.error('First name and last name are required'); return;
    }
    setAdding(true);
    try {
      const payload = {
        ...addForm,
        year: addForm.year ? parseInt(addForm.year) : undefined,
        roomId: addForm.roomId ? parseInt(addForm.roomId) : undefined,
      };
      const { data } = await adminUserAPI.createStudent(payload);
      toast.success(`Student created! Username: ${data.username} · ID: ${data.studentCode}`);
      setAddModal(false);
      loadStudents();
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    } finally { setAdding(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await studentAPI.update(editModal.id, editModal);
      toast.success('Student updated');
      setEditModal(null);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAssignRoom = async () => {
    if (!selectedRoom) { toast.error('Please select a room'); return; }
    setSaving(true);
    try {
      await studentAPI.assignRoom(roomModal.id, selectedRoom);
      toast.success('Room assigned successfully');
      setRoomModal(null);
      loadStudents();
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally { setSaving(false); }
  };

  const handleVacate = async (id, name) => {
    if (!window.confirm(`Vacate ${name} from their room?`)) return;
    try {
      await studentAPI.vacateRoom(id);
      toast.success('Room vacated');
      loadStudents(); loadRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      loadStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const setEditField = k => e => setEditModal(m => ({ ...m, [k]: e.target.value }));

  const columns = [
    { key: 'studentId', label: 'ID', width: 100 },
    { key: 'name', label: 'Name', render: s => (
      <div>
        <span style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</span>
        <span style={{ display: 'block', fontSize: '.75rem', color: 'var(--ink-mute)' }}>{s.email}</span>
      </div>
    )},
    { key: 'course', label: 'Course', render: s => s.course ? `${s.course} · ${s.branch} · Y${s.year}` : '—' },
    { key: 'room', label: 'Room', render: s => s.room
      ? <Badge label={s.room.roomNumber} color="teal" />
      : <span style={{ color: 'var(--ink-mute)', fontSize: '.82rem' }}>Unassigned</span>
    },
    { key: 'admission', label: 'Admitted', render: s => formatDate(s.admissionDate) },
    { key: 'status', label: 'Status', render: s => <Badge label={s.status} color={statusColor[s.status] || 'gray'} /> },
    { key: 'actions', label: '', render: s => (
      <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
        <Button size="sm" variant="outline" onClick={() => setEditModal({ ...s })}>Edit</Button>
        {isAdmin && (
          <Button size="sm" variant="ghost" onClick={() => { setRoomModal(s); setSelectedRoom(''); }}>
            {s.room ? 'Reassign' : 'Assign'} Room
          </Button>
        )}
        {isAdmin && s.room && (
          <Button size="sm" variant="ghost" onClick={() => handleVacate(s.id, `${s.firstName} ${s.lastName}`)}>Vacate</Button>
        )}
        {isAdmin && (
          <Button size="sm" variant="danger" onClick={() => handleDelete(s.id, `${s.firstName} ${s.lastName}`)}>✕</Button>
        )}
      </div>
    )},
  ];

  const noteStyle = { padding: '8px 12px', background: 'var(--surface)', borderRadius: 6, fontSize: '.8rem', color: 'var(--ink-soft)', borderLeft: '3px solid var(--amber)', marginBottom: 4 };
  const lockedStyle = { opacity: 0.6, cursor: 'not-allowed' };

  return (
    <div className="fade-up">
      <PageHeader
        title="Students"
        subtitle={`${students.length} registered · ${filtered.length} shown`}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="search-input" placeholder="Search name, ID, email…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="mini-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              {['ACTIVE','INACTIVE','CHECKED_OUT'].map(s => <option key={s}>{s}</option>)}
            </select>
            {isAdmin && <Button variant="amber" onClick={openAdd}>+ Add Student</Button>}
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty icon="◎" message={search ? `No students matching "${search}"` : 'No students yet. Add one to get started.'} />
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      {/* ── Add Student Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Student" size="lg">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ n: 1, label: 'Credentials & Profile' }, { n: 2, label: 'Room Assignment' }].map(({ n, label }) => (
            <button key={n} onClick={() => setAddStep(n)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: '.8rem', fontWeight: 500,
              background: addStep === n ? 'var(--amber)' : 'var(--border)',
              color: addStep === n ? '#fff' : 'var(--ink-soft)',
            }}>{n}. {label}</button>
          ))}
        </div>

        {addStep === 1 && (
          <div className="form-grid">
            <div className="full" style={noteStyle}>These credentials will be shared with the student to log in. They cannot be changed by the student later.</div>
            <Input label="Username *"    value={addForm.username}    onChange={setAddField('username')}    placeholder="e.g. john_doe" />
            <Input label="Email *"       value={addForm.email}       onChange={setAddField('email')}       type="email" placeholder="student@college.edu" />
            <Input label="Password *"    value={addForm.password}    onChange={setAddField('password')}    type="password" placeholder="Min. 6 characters" />
            <Input label="Student ID"    value={addForm.studentId}   onChange={setAddField('studentId')}   placeholder="Auto-generated if blank" />
            <Input label="First Name *"  value={addForm.firstName}   onChange={setAddField('firstName')} />
            <Input label="Last Name *"   value={addForm.lastName}    onChange={setAddField('lastName')} />
            <Input label="Phone"         value={addForm.phoneNumber} onChange={setAddField('phoneNumber')} />
            <Input label="Date of Birth" value={addForm.dateOfBirth} onChange={setAddField('dateOfBirth')} type="date" />
            <Input label="Parent Name"   value={addForm.parentName}  onChange={setAddField('parentName')} />
            <Input label="Parent Phone"  value={addForm.parentPhone} onChange={setAddField('parentPhone')} />
            <Input label="Course"        value={addForm.course}      onChange={setAddField('course')} />
            <Input label="Branch"        value={addForm.branch}      onChange={setAddField('branch')} />
            <Input label="Year"          value={addForm.year}        onChange={setAddField('year')}        type="number" min={1} max={4} />
            <Input label="City"          value={addForm.city}        onChange={setAddField('city')} />
            <Input label="State"         value={addForm.state}       onChange={setAddField('state')} />
            <Input label="Address"       value={addForm.address}     onChange={setAddField('address')}     className="full" />
            <div className="form-actions full">
              <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
              <Button variant="amber" onClick={() => setAddStep(2)}>Next: Assign Room →</Button>
            </div>
          </div>
        )}

        {addStep === 2 && (
          <div>
            <p style={{ marginBottom: 14, color: 'var(--ink-soft)', fontSize: '.9rem' }}>
              Assigning room for <strong>{addForm.firstName} {addForm.lastName}</strong>. You can skip and assign later.
            </p>
            <Select label="Room (optional)" value={addForm.roomId} onChange={setAddField('roomId')}>
              <option value="">No room — assign later</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} — Block {r.block}, Floor {r.floor} — {r.roomType} — {r.capacity - r.occupiedCount} slot(s) free — ₹{Number(r.monthlyFee).toLocaleString()}/mo
                </option>
              ))}
            </Select>
            {rooms.length === 0 && (
              <p style={{ fontSize: '.82rem', color: 'var(--rose)', marginTop: 8 }}>No available rooms right now.</p>
            )}
            <div className="form-actions" style={{ marginTop: 20 }}>
              <Button variant="outline" onClick={() => setAddStep(1)}>← Back</Button>
              <Button variant="amber" loading={adding} onClick={handleAdd}>Create Student</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Student" size="lg">
        {editModal && (
          <div className="form-grid">
            <div className="full" style={{ ...noteStyle, borderLeftColor: 'var(--border)' }}>
              Username, email and room are admin-controlled and cannot be edited here.
            </div>
            <div className="field">
              <label className="field-label">Username (locked)</label>
              <input className="field-input" value={editModal.user?.username || '—'} disabled style={lockedStyle} />
            </div>
            <div className="field">
              <label className="field-label">Email (locked)</label>
              <input className="field-input" value={editModal.email || '—'} disabled style={lockedStyle} />
            </div>
            <Input label="First Name"   value={editModal.firstName   || ''} onChange={setEditField('firstName')} />
            <Input label="Last Name"    value={editModal.lastName    || ''} onChange={setEditField('lastName')} />
            <Input label="Phone"        value={editModal.phoneNumber || ''} onChange={setEditField('phoneNumber')} />
            <Input label="Parent Name"  value={editModal.parentName  || ''} onChange={setEditField('parentName')} />
            <Input label="Parent Phone" value={editModal.parentPhone || ''} onChange={setEditField('parentPhone')} />
            <Input label="Date of Birth" type="date" value={editModal.dateOfBirth || ''} onChange={setEditField('dateOfBirth')} />
            <Input label="Course"       value={editModal.course  || ''} onChange={setEditField('course')} />
            <Input label="Branch"       value={editModal.branch  || ''} onChange={setEditField('branch')} />
            <Input label="Year"         type="number" value={editModal.year || ''} onChange={setEditField('year')} min={1} max={4} />
            <Select label="Status"      value={editModal.status  || 'ACTIVE'} onChange={setEditField('status')}>
              {['ACTIVE','INACTIVE','CHECKED_OUT'].map(s => <option key={s}>{s}</option>)}
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

      {/* ── Assign Room Modal ── */}
      <Modal open={!!roomModal} onClose={() => setRoomModal(null)} title="Assign Room" size="sm">
        {roomModal && (
          <div>
            <p style={{ marginBottom: 14, color: 'var(--ink-soft)', fontSize: '.9rem' }}>
              Assigning room for <strong>{roomModal.firstName} {roomModal.lastName}</strong>
              {roomModal.room && <span style={{ color: 'var(--ink-mute)' }}> (currently in {roomModal.room.roomNumber})</span>}
            </p>
            <Select label="Available Rooms" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
              <option value="">Select a room…</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} — Block {r.block}, Floor {r.floor} — {r.roomType} — {r.capacity - r.occupiedCount} slot(s) free — ₹{Number(r.monthlyFee).toLocaleString()}/mo
                </option>
              ))}
            </Select>
            {rooms.length === 0 && (
              <p style={{ fontSize: '.82rem', color: 'var(--rose)', marginTop: 8 }}>No available rooms.</p>
            )}
            <div className="form-actions">
              <Button variant="outline" onClick={() => setRoomModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handleAssignRoom} disabled={!selectedRoom}>Assign Room</Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .search-input { height:36px; padding:0 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:var(--font-body); font-size:.875rem; outline:none; min-width:240px; }
        .search-input:focus { border-color:var(--amber); }
        .mini-select { height:36px; padding:0 10px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:var(--font-body); font-size:.875rem; background:var(--card); cursor:pointer; outline:none; }
        .mini-select:focus { border-color:var(--amber); }
      `}</style>
    </div>
  );
}
