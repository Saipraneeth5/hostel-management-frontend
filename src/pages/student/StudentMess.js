import React, { useEffect, useState } from 'react';
import { messAPI } from '../../api';
import { PageHeader, Badge, Spinner } from '../../components/common/UI';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const MEAL_COLOR = { BREAKFAST: 'amber', LUNCH: 'teal', SNACKS: 'blue', DINNER: 'rose' };
const MEAL_ICON  = { BREAKFAST: '☀', LUNCH: '◉', SNACKS: '◇', DINNER: '☾' };

export default function StudentMess() {
  const [menu, setMenu]       = useState([]);
  const [today, setToday]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    return days[new Date().getDay()];
  });

  useEffect(() => {
    Promise.all([messAPI.getAll(), messAPI.getToday()])
      .then(([all, tod]) => { setMenu(all.data); setToday(tod.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dayMenu = menu.filter(m => m.dayOfWeek === activeDay);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spinner size="lg" /></div>;

  return (
    <div className="fade-up">
      <PageHeader title="Mess Menu" subtitle="Weekly meal schedule" />

      {today.length > 0 && (
        <div style={{ background: 'var(--amber-lt)', border: '1px solid rgba(232,160,32,.3)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--amber-dk)', marginBottom: 8 }}>Today's Menu</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {today.map(m => (
              <div key={m.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '8px 14px', border: '1px solid var(--border)' }}>
                <Badge label={m.mealType} color={MEAL_COLOR[m.mealType]} />
                <p style={{ fontSize: '.85rem', marginTop: 4 }}>{m.items}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            style={{
              padding: '7px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeDay === day ? 'var(--ink)' : 'var(--card)',
              color: activeDay === day ? '#fff' : 'var(--ink-soft)',
              border: activeDay === day ? 'none' : '1px solid var(--border)',
              transition: 'all .15s',
            }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {['BREAKFAST','LUNCH','SNACKS','DINNER'].map(meal => {
          const items = dayMenu.filter(m => m.mealType === meal);
          return (
            <div key={meal} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{MEAL_ICON[meal]}</span>
                <Badge label={meal} color={MEAL_COLOR[meal]} />
              </div>
              {items.length === 0 ? (
                <p style={{ fontSize: '.82rem', color: 'var(--ink-mute)', fontStyle: 'italic' }}>Not available</p>
              ) : (
                items.map(item => (
                  <div key={item.id}>
                    <p style={{ fontSize: '.9rem', fontWeight: 500 }}>{item.items}</p>
                    {item.description && <p style={{ fontSize: '.78rem', color: 'var(--ink-mute)', marginTop: 3 }}>{item.description}</p>}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
