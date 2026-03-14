import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../api';
import { PageHeader, Button, Badge, Table, Modal, Select, Spinner, Empty } from '../../components/common/UI';
import { formatCurrency, formatDate, statusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [method, setMethod]     = useState('UPI');
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState('ALL');

  const load = () => {
    setLoading(true);
    paymentAPI.getMy()
      .then(r => setPayments(r.data))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);

  const totalPending = payments
    .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const handlePay = async () => {
    setSaving(true);
    try {
      await paymentAPI.markPaid(payModal.id, method);
      toast.success('Payment recorded successfully');
      setPayModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const columns = [
    { key: 'transactionId', label: 'TXN ID',   render: p => <code style={{ fontSize: '.72rem', color: 'var(--ink-mute)' }}>{p.transactionId}</code> },
    { key: 'paymentType',   label: 'Type',      render: p => <Badge label={p.paymentType?.replace(/_/g,' ')} color="gray" /> },
    { key: 'amount',        label: 'Amount',    render: p => <strong>{formatCurrency(p.amount)}</strong> },
    { key: 'forMonth',      label: 'Month',     render: p => p.forMonth || '—' },
    { key: 'dueDate',       label: 'Due Date',  render: p => formatDate(p.dueDate) },
    { key: 'paymentDate',   label: 'Paid On',   render: p => formatDate(p.paymentDate) },
    { key: 'paymentMethod', label: 'Method',    render: p => p.paymentMethod || '—' },
    { key: 'status',        label: 'Status',    render: p => <Badge label={p.status} color={statusColor[p.status] || 'gray'} /> },
    { key: 'actions',       label: '',          render: p => (
      (p.status === 'PENDING' || p.status === 'OVERDUE')
        ? <Button size="sm" variant="success" onClick={() => { setPayModal(p); setMethod('UPI'); }}>Pay Now</Button>
        : null
    )},
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="My Payments"
        subtitle={totalPending > 0
          ? `${formatCurrency(totalPending)} outstanding`
          : 'All payments up to date ✓'}
        action={
          <select className="mini-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All</option>
            {['PENDING','PAID','OVERDUE','WAIVED'].map(s => <option key={s}>{s}</option>)}
          </select>
        }
      />

      {totalPending > 0 && (
        <div style={{
          background: 'var(--rose-lt)',
          border: '1px solid rgba(225,29,72,.2)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--rose)', fontSize: '.875rem', fontWeight: 500,
        }}>
          <span>◈</span>
          You have {formatCurrency(totalPending)} in outstanding payments. Please clear them promptly.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty icon="◇" message="No payment records found." />
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Confirm Payment" size="sm">
        {payModal && (
          <div>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: '.8rem', color: 'var(--ink-mute)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                {payModal.paymentType?.replace(/_/g, ' ')}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '4px 0' }}>
                {formatCurrency(payModal.amount)}
              </p>
              {payModal.forMonth && (
                <p style={{ fontSize: '.82rem', color: 'var(--ink-mute)' }}>For: {payModal.forMonth}</p>
              )}
              {payModal.dueDate && (
                <p style={{ fontSize: '.82rem', color: payModal.status === 'OVERDUE' ? 'var(--rose)' : 'var(--ink-mute)' }}>
                  Due: {formatDate(payModal.dueDate)}
                </p>
              )}
            </div>
            <Select label="Payment Method" value={method} onChange={e => setMethod(e.target.value)}>
              {['UPI','ONLINE','CASH','BANK_TRANSFER','CHEQUE'].map(m => <option key={m}>{m}</option>)}
            </Select>
            <div className="form-actions">
              <Button variant="outline" onClick={() => setPayModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handlePay}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`.mini-select{height:36px;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.875rem;background:var(--card);cursor:pointer;outline:none;}.mini-select:focus{border-color:var(--amber);}`}</style>
    </div>
  );
}
