import React, { useEffect, useState } from 'react';
import { messAPI } from '../../api';
import { PageHeader, Button, Badge, Modal, Input, Select, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const MEALS = ['BREAKFAST','LUNCH','SNACKS','DINNER'];
const MEAL_COLOR = { BREAKFAST: 'amber', LUNCH: 'teal', SNACKS: 'blue', DINNER: 'rose' };

export default function MessMenuPage() {
  const [menu, setMenu]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay]   = useState('MONDAY');
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    messAPI.getAll()
      .then(r => setMenu(r.data))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const dayMenu = menu.filter(m => m.dayOfWeek === activeDay);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await messAPI.create(modal.data);
        toast.success('Menu item added');
      } else {
        await messAPI.update(modal.data.id, modal.data);
        toast.success('Menu updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await messAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  const setField = k => e => setModal(m => ({ ...m, data: { ...m.data, [k]: e.target.value } }));

  return (
    <div className="fade-up">
      <PageHeader
        title="Mess Menu"
        subtitle="Weekly meal schedule"
        action={
          <Button variant="amber" onClick={() => setModal({ mode: 'create', data: { dayOfWeek: activeDay, mealType: 'BREAKFAST', items: '', description: '' } })}>
            + Add Item
          </Button>
        }
      />

      {/* Day tabs */}
      <div className="day-tabs">
        {DAYS.map(day => (
          <button
            key={day}
            className={`day-tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day.slice(0,3)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : (
        <div className="mess-grid">
          {MEALS.map(meal => {
            const items = dayMenu.filter(m => m.mealType === meal);
            return (
              <div key={meal} className="mess-card">
                <div className="mess-card-header">
                  <Badge label={meal} color={MEAL_COLOR[meal]} />
                </div>
                {items.length === 0 ? (
                  <p className="mess-empty">No items added</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="mess-item">
                      <div className="mess-item-body">
                        <p className="mess-item-name">{item.items}</p>
                        {item.description && <p className="mess-item-desc">{item.description}</p>}
                      </div>
                      <div className="mess-item-actions">
                        <Button size="sm" variant="ghost" onClick={() => setModal({ mode: 'edit', data: { ...item } })}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>✕</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add Menu Item' : 'Edit Menu Item'} size="sm">
        {modal && (
          <div className="form-grid">
            <Select label="Day" value={modal.data.dayOfWeek} onChange={setField('dayOfWeek')}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </Select>
            <Select label="Meal" value={modal.data.mealType} onChange={setField('mealType')}>
              {MEALS.map(m => <option key={m}>{m}</option>)}
            </Select>
            <Input label="Items *" value={modal.data.items} onChange={setField('items')} placeholder="Rice, Dal, Sabzi…" className="full" />
            <Input label="Description" value={modal.data.description || ''} onChange={setField('description')} className="full" />
            <div className="form-actions full">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="amber" loading={saving} onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .day-tabs{display:flex;gap:4px;margin-bottom:20px;background:var(--card);padding:4px;border-radius:var(--radius);border:1px solid var(--border);width:fit-content;}
        .day-tab{padding:6px 14px;border:none;background:none;border-radius:6px;font-family:var(--font-body);font-size:.82rem;font-weight:500;cursor:pointer;color:var(--ink-mute);transition:all .15s;}
        .day-tab.active{background:var(--ink);color:#fff;}
        .day-tab:hover:not(.active){background:var(--surface);}
        .mess-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
        .mess-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;display:flex;flex-direction:column;gap:10px;}
        .mess-card-header{display:flex;justify-content:space-between;align-items:center;}
        .mess-empty{font-size:.82rem;color:var(--ink-mute);font-style:italic;}
        .mess-item{background:var(--surface);border-radius:var(--radius-sm);padding:10px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;}
        .mess-item-name{font-size:.875rem;font-weight:500;}
        .mess-item-desc{font-size:.78rem;color:var(--ink-mute);margin-top:2px;}
        .mess-item-actions{display:flex;gap:4px;flex-shrink:0;}
      `}</style>
    </div>
  );
}
