import React from 'react';
import axios from 'axios';

export default function Calendar() {
  const [message, setMessage] = React.useState('');
  const [monthCursor, setMonthCursor] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [summary, setSummary] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [dayItems, setDayItems] = React.useState([]);
  const [viewOpen, setViewOpen] = React.useState(false);

  const fmtMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const weekdayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const fetchSummary = React.useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.get('/api/activities/summary', { params: { month: fmtMonthKey(monthCursor) } });
      setSummary(Array.isArray(data) ? data : []);
    } catch (e) {
      setSummary([]);
      setMessage('Unable to load activities');
    } finally { setLoading(false); }
  }, [monthCursor]);


  React.useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const fetchDay = React.useCallback(async (dateStr) => {
    try {
      const { data } = await axios.get('/api/activities/day', { params: { date: dateStr } });
      setDayItems(Array.isArray(data?.items) ? data.items : []);
    } catch { setDayItems([]); }
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => { fetchSummary(); }, 20000);
    return () => clearInterval(t);
  }, [fetchSummary]);

  const mapByDate = React.useMemo(() => {
    const m = new Map();
    for (const r of summary) m.set(r.date, r);
    return m;
  }, [summary]);

  const gridDays = React.useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leading = firstDay.getDay();
    const total = leading + lastDay.getDate();
    const rows = Math.ceil(total / 7);
    const out = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c;
        const dayNum = idx - leading + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) { row.push(null); continue; }
        const d = new Date(year, month, dayNum);
        row.push({ date: d, key: fmtISO(d) });
      }
      out.push(row);
    }
    return out;
  }, [monthCursor]);

  const totalsFor = (key) => {
    const r = mapByDate.get(key);
    if (!r) return { all: 0, students: 0, faculties: 0, offerings: 0, logins: 0 };
    const all = (r.students||0)+(r.faculties||0)+(r.offerings||0)+(r.logins||0);
    return { all, students: r.students||0, faculties: r.faculties||0, offerings: r.offerings||0, logins: r.logins||0 };
  };

  const monthTotals = React.useMemo(() => {
    return summary.reduce((acc, r) => {
      acc.students += r.students||0; acc.faculties += r.faculties||0; acc.offerings += r.offerings||0; acc.logins += r.logins||0; return acc;
    }, { students:0, faculties:0, offerings:0, logins:0 });
  }, [summary]);

  const todayISO = fmtISO(new Date());

  return (
    <div className="students-page calendar-page">
      <div className="module-page">
        <div className="page-header">
          <h1>Calendar</h1>
        </div>

        {message && <div className="alert alert-info" style={{marginTop:8}}>{message}</div>}

        <div className="form-card">
          <h2>Monthly Overview</h2>
          <div className="module-form">
            <div className="form-row calendar-toolbar">
              <button className="btn btn-secondary" type="button" onClick={()=>setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth()-1, 1))}>Prev</button>
              <div className="month-title">{monthCursor.toLocaleString(undefined, { month:'long', year:'numeric' })} {loading ? '•' : ''}</div>
              <button className="btn btn-secondary" type="button" onClick={()=>setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth()+1, 1))}>Next</button>
              <button className="btn btn-secondary" type="button" onClick={()=>{ const d=new Date(); setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</button>
            </div>
            <div className="form-row calendar-stats">
              <div className="calendar-stat">Students: <strong>{monthTotals.students}</strong></div>
              <div className="calendar-stat">Faculty: <strong>{monthTotals.faculties}</strong></div>
              <div className="calendar-stat">Offerings: <strong>{monthTotals.offerings}</strong></div>
              <div className="calendar-stat">Logins: <strong>{monthTotals.logins}</strong></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-primary" disabled={!selectedDate} onClick={async()=>{ const d = selectedDate || fmtISO(new Date()); setSelectedDate(d); await fetchDay(d); setViewOpen(true); }}>View Day</button>
            </div>
          </div>

          <div className="table-card calendar-grid" style={{marginTop:12}}>
            <table className="data-table">
              <thead>
                <tr>
                  {weekdayLabels.map(w=> (<th key={w}>{w}</th>))}
                </tr>
              </thead>
              <tbody>
                {gridDays.map((row,ri)=> (
                  <tr key={'r'+ri}>
                    {row.map((cell,ci)=> {
                      if (!cell) return <td key={'c'+ci} />;
                      const k = cell.key;
                      const t = totalsFor(k);
                      const isToday = k === todayISO;
                      const isSelected = k === selectedDate;
                      return (
                        <td key={'c'+ci} className={`calendar-day${isToday?' is-today':''}${isSelected?' is-selected':''}`} onClick={()=>setSelectedDate(k)}>
                          <div className="day-head">
                            <div className="day-num">{cell.date.getDate()}</div>
                            {t.all>0 && <span className="count-pill">{t.all}</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewOpen && (
          <div className="student-view-modal" onClick={(e)=>{ if(e.target===e.currentTarget) setViewOpen(false); }}>
            <div className="student-view-card">
              <div className="page-header">
                <h2>Activity • {selectedDate || '—'}</h2>
                <button type="button" className="btn" onClick={()=>setViewOpen(false)}>Close</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Label</th>
                  </tr>
                </thead>
                <tbody>
                  {dayItems.length === 0 && (
                    <tr><td colSpan="3" style={{color:'var(--text-secondary)'}}>No activity for this day.</td></tr>
                  )}
                  {dayItems.map((it, idx) => (
                    <tr key={idx}>
                      <td>{new Date(it.time).toLocaleTimeString()}</td>
                      <td>{String(it.type || '').replace(/_/g,' ')}</td>
                      <td>{it.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setViewOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
