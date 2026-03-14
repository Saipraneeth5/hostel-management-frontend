import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../api';
import { PageHeader, Button, Input, Spinner, Card } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);

  const load = () => {
    studentAPI.getMe()
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentAPI.update(profile.id, form);
      toast.success('Profile updated');
      setEditing(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spinner size="lg" /></div>;
  if (!profile) return <p style={{ color: 'var(--ink-mute)' }}>No profile found.</p>;

  return (
    <div className="fade-up">
      <PageHeader
        title="My Profile"
        subtitle={`Student ID: ${profile.studentId}`}
        action={
          editing
            ? <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</Button>
                <Button variant="amber" loading={saving} onClick={handleSave}>Save Changes</Button>
              </div>
            : <Button variant="amber" onClick={() => setEditing(true)}>Edit Profile</Button>
        }
      />

      {/* Locked-fields notice — only shown while editing */}
      {editing && (
        <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 8, fontSize: '.82rem', color: 'var(--ink-soft)', borderLeft: '3px solid var(--border)', marginBottom: 16 }}>
          Username, email and room number are assigned by the admin and cannot be changed here.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal Information */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Personal Information</h3>
          {editing ? (
            <div className="form-grid">
              {/* Locked: username */}
              <div className="field">
                <label className="field-label">Username (locked)</label>
                <input className="field-input" value={profile.user?.username || '—'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              {/* Locked: email */}
              <div className="field">
                <label className="field-label">Email (locked)</label>
                <input className="field-input" value={profile.email || '—'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <Input label="First Name" value={form.firstName || ''} onChange={set('firstName')} />
              <Input label="Last Name"  value={form.lastName  || ''} onChange={set('lastName')} />
              <Input label="Phone"      value={form.phoneNumber || ''} onChange={set('phoneNumber')} />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth || ''} onChange={set('dateOfBirth')} />
              <Input label="Parent Name"  value={form.parentName  || ''} onChange={set('parentName')} />
              <Input label="Parent Phone" value={form.parentPhone || ''} onChange={set('parentPhone')} />
            </div>
          ) : (
            <InfoGrid rows={[
              ['Username',     profile.user?.username || '—'],
              ['Full Name',    `${profile.firstName} ${profile.lastName}`],
              ['Email',        profile.email],
              ['Phone',        profile.phoneNumber || '—'],
              ['Date of Birth',profile.dateOfBirth || '—'],
              ['Parent Name',  profile.parentName  || '—'],
              ['Parent Phone', profile.parentPhone  || '—'],
            ]} />
          )}
        </Card>

        {/* Academic Details */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Academic Details</h3>
          {editing ? (
            <div className="form-grid">
              <Input label="Course" value={form.course || ''} onChange={set('course')} />
              <Input label="Branch" value={form.branch || ''} onChange={set('branch')} />
              <Input label="Year"   type="number" value={form.year || ''} onChange={set('year')} min={1} max={4} />
            </div>
          ) : (
            <InfoGrid rows={[
              ['Course',         profile.course || '—'],
              ['Branch',         profile.branch || '—'],
              ['Year',           profile.year ? `Year ${profile.year}` : '—'],
              ['Admission Date', profile.admissionDate || '—'],
              ['Status',         profile.status],
            ]} />
          )}
        </Card>

        {/* Room — always read-only for student */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Room Information</h3>
          {profile.room ? (
            <InfoGrid rows={[
              ['Room Number',   profile.room.roomNumber],
              ['Type',          profile.room.roomType],
              ['Block / Floor', `Block ${profile.room.block}, Floor ${profile.room.floor}`],
              ['Monthly Fee',   `₹${Number(profile.room.monthlyFee).toLocaleString()}`],
              ['AC',            profile.room.hasAc ? 'Yes' : 'No'],
              ['Attached Bath', profile.room.hasAttachedBathroom ? 'Yes' : 'No'],
            ]} />
          ) : (
            <p style={{ color: 'var(--ink-mute)', fontSize: '.9rem' }}>
              No room assigned yet. Contact your warden or admin.
            </p>
          )}
          {editing && (
            <p style={{ fontSize: '.78rem', color: 'var(--ink-mute)', marginTop: 10 }}>
              Room assignment is managed by the admin only.
            </p>
          )}
        </Card>

        {/* Address */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Address</h3>
          {editing ? (
            <div className="form-grid">
              <Input label="Address" value={form.address || ''} onChange={set('address')} className="full" />
              <Input label="City"    value={form.city    || ''} onChange={set('city')} />
              <Input label="State"   value={form.state   || ''} onChange={set('state')} />
            </div>
          ) : (
            <InfoGrid rows={[
              ['Address', profile.address || '—'],
              ['City',    profile.city    || '—'],
              ['State',   profile.state   || '—'],
            ]} />
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '.8rem', color: 'var(--ink-mute)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: '.875rem', fontWeight: 500 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
