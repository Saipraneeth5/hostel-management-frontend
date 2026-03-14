import React, { useEffect, useState } from 'react';
import { paymentAPI, studentAPI } from '../../api';
import {
  PageHeader, Button, Badge, Table, Modal,
  Input, Select, StatCard, Spinner, Empty,
} from '../../components/common/UI';
import { formatCurrency, formatDate, statusColor, currentYearMonth } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [payments, setPayments]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [createModal, setCreateModal]   = useState(false);
  const [monthModal, setMonthModal]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [month, setMonth]         = useState(currentYearMonth());
  const [newPayment, setNewPayment] = useState({
    studentId: '', amount: '', paymentType: 'ROOM_RENT',
    description: '', forMonth: currentYearMonth(), dueDate: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([paymentAPI.getAll(), paymentAPI.getStats()])
      .then(([p, s]) => { setPayments(p.data); setStats(s.data); })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    studentAPI.getAll().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const filtered = filterStatus === 'ALL'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  const handleMarkPaid = async (id, method = 'CASH') => {
    try {
      await paymentAPI.markPaid(id, method);
      toast.success('Marked as paid');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await paymentAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleCreate = async () => {
    if (!newPayment.studentId) { toast.error('Select a student'); return; }
    if (!newPayment.amount)    { toast.error('Enter an amount'); return; }
    setSaving(true);
    try {
      await paymentAPI.create(newPayment.studentId, {
        amount:      parseFloat(newPayment.amount),
        paymentType: newPayment.paymentType,
        description: newPayment.description,
        forMonth:    newPayment.forMonth || undefined,
        dueDate:     newPayment.dueDate  || undefined,
      });
      toast.success('Payment record created');
      setCreateModal(false);
      setNewPayment({ studentId: '', amount: '', paymentType: 'ROOM_RENT', description: '', forMonth: currentYearMonth(), dueDate: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleGenerateMonthly = async () => {
    if (!month) { toast.error('Enter a month'); return; }
    setSaving(true);
    try {
      await paymentAPI.generateMonthly(month);
      toast.success(`Monthly fees generated for ${month}`);
      setMonthModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const setNP = k => e => setNewPayment(p => ({ ...p, [k]: e.target.value }));

  const columns = [
    { key: 'transactionId', label: 'TXN ID',  render: p => <code style={{ fontSize: '.72rem', color: 'var(--ink-soft)' }}>{p.transactionId}</code> },
    { key: 'student',       label: 'Student', render: p => p.student
      ? <div><span style={{ fontWeight: 500 }}>{p.student.firstName} {p.student.lastName}</span></div>
      : '—'
    },
    { key: 'amount',      label: 'Amount',   render: p => <strong>{formatCurrency(p.amount)}</strong> },
    { key: 'paymentType', label: 'Type',     render: p => <Badge label={p.paymentType?.replace('_',' ')} color="gray" /> },
    { key: 'forMonth',    label: 'Month',    render: p => p.forMonth || '—' },
    { key: 'dueDate',     label: 'Due',      render: p => formatDate(p.dueDate) },
    { key: 'paymentDate', label: 'Paid On',  render: p => formatDate(p.paymentDate) },
    { key: 'status',      label: 'Status',   render: p => <Badge label={p.status} color={statusColor[p.status] || 'gray'} /> },
    { key: 'actions',     label: '',         render: p => (
      <div style={{ display: 'flex', gap: 6 }}>
        {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
          <Button size="sm" variant="success" onClick={() => handleMarkPaid(p.id)}>Mark Paid</Button>
        )}
        <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>✕</Button>
      </div>
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} records`}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="mini-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              {['PENDING','PAID','OVERDUE','WAIVED','FAILED'].map(s => <option key={s}>{s}</option>)}
            </select>
            <Button variant="outline" onClick={() => setMonthModal(true)}>⊞ Generate Monthly</Button>
            <Button variant="amber" onClick={() => setCreateModal(true)}>+ Add Record</Button>
          </div>
        }
      />

      {/* Stats strip */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
          <StatCard label="Total Collected" value={formatCurrency(stats.totalCollected)} icon="◇" color="green" />
          <StatCard label="Total Pending"   value={formatCurrency(stats.totalPending)}   icon="◈" color="amber" />
          <StatCard label="Pending Count"   value={stats.pendingPayments} icon="⊞" color={stats.pendingPayments > 0 ? 'rose' : 'teal'} />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty icon="◇" message="No payment records found." />
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Payment Record" size="md">
        <div className="form-grid">
          <Select label="Student *" value={newPayment.studentId} onChange={setNP('studentId')} className="full">
            <option value="">Select student…</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
            ))}
          </Select>
          <Input label="Amount (₹) *" type="number" value={newPayment.amount} onChange={setNP('amount')} placeholder="0.00" />
          <Select label="Type *" value={newPayment.paymentType} onChange={setNP('paymentType')}>
            {['ROOM_RENT','MESS_FEE','SECURITY_DEPOSIT','FINE','OTHER'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="For Month (YYYY-MM)" value={newPayment.forMonth} onChange={setNP('forMonth')} placeholder={currentYearMonth()} />
          <Input label="Due Date" type="date" value={newPayment.dueDate} onChange={setNP('dueDate')} />
          <Input label="Description" value={newPayment.description} onChange={setNP('description')} className="full" />
          <div className="form-actions full">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleCreate}>Create Record</Button>
          </div>
        </div>
      </Modal>

      {/* Monthly Modal */}
      <Modal open={monthModal} onClose={() => setMonthModal(false)} title="Generate Monthly Fees" size="sm">
        <p style={{ fontSize: '.875rem', color: 'var(--ink-soft)', marginBottom: 14, lineHeight: 1.6 }}>
          Generates <strong>ROOM_RENT</strong> payment records for all active students who have a room assigned.
          Skips students who already have a record for that month.
        </p>
        <Input label="Month (YYYY-MM) *" value={month} onChange={e => setMonth(e.target.value)} placeholder={currentYearMonth()} />
        <div className="form-actions">
          <Button variant="outline" onClick={() => setMonthModal(false)}>Cancel</Button>
          <Button variant="amber" loading={saving} onClick={handleGenerateMonthly}>Generate Fees</Button>
        </div>
      </Modal>

      <style>{`.mini-select{height:36px;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.875rem;background:var(--card);cursor:pointer;outline:none;}.mini-select:focus{border-color:var(--amber);}`}</style>
    </div>
  );
}
