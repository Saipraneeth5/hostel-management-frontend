import React, { useEffect, useState } from 'react';
import { wardenAPI } from '../../api';
import { PageHeader, Button, Input, Select, Spinner, Card } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function WardenProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);

  const load = () => {
    wardenAPI.getMe()
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await wardenAPI.updateMe(form);
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
        subtitle={`Warden ID: ${profile.wardenId}`}
        action={
          editing
            ? <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</Button>
                <Button variant="amber" loading={saving} onClick={handleSave}>Save Changes</Button>
              </div>
            : <Button variant="amber" onClick={() => setEditing(true)}>Edit Profile</Button>
        }
      />

      {editing && (
        <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 8, fontSize: '.82rem', color: 'var(--ink-soft)', borderLeft: '3px solid var(--border)', marginBottom: 16 }}>
          Username, email and assigned block are set by the admin and cannot be changed here.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal Information */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Personal Information</h3>
          {editing ? (
            <div className="form-grid">
              <div className="field">
                <label className="field-label">Username (locked)</label>
                <input className="field-input" value={profile.user?.username || '—'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="field">
                <label className="field-label">Email (locked)</label>
                <input className="field-input" value={profile.email || '—'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <Input label="First Name"    value={form.firstName    || ''} onChange={set('firstName')} />
              <Input label="Last Name"     value={form.lastName     || ''} onChange={set('lastName')} />
              <Input label="Phone"         value={form.phoneNumber  || ''} onChange={set('phoneNumber')} />
              <Input label="Date of Birth" value={form.dateOfBirth  || ''} onChange={set('dateOfBirth')} type="date" />
              <Input label="Qualification" value={form.qualification|| ''} onChange={set('qualification')} placeholder="e.g. M.Sc, B.Ed" />
            </div>
          ) : (
            <InfoGrid rows={[
              ['Username',      profile.user?.username  || '—'],
              ['Full Name',     `${profile.firstName} ${profile.lastName}`],
              ['Email',         profile.email],
              ['Phone',         profile.phoneNumber     || '—'],
              ['Date of Birth', profile.dateOfBirth     || '—'],
              ['Qualification', profile.qualification   || '—'],
            ]} />
          )}
        </Card>

        {/* Assignment — always read-only for warden */}
        <Card>
          <h3 style={{ marginBottom: 16 }}>Assignment</h3>
          <InfoGrid rows={[
            ['Warden ID',      profile.wardenId],
            ['Assigned Block', profile.assignedBlock ? `Block ${profile.assignedBlock}` : '—'],
            ['Status',         profile.status],
          ]} />
          {editing && (
            <p style={{ fontSize: '.78rem', color: 'var(--ink-mute)', marginTop: 10 }}>
              Block assignment and status are managed by the admin only.
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
