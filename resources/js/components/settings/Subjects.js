import React, { useMemo, useState } from 'react';
import axios from 'axios';

export default function Subjects() {
  const [raw, setRaw] = useState('');
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [replace, setReplace] = useState(true);
  const [loading, setLoading] = useState(false);

  const parsedStats = useMemo(() => ({ count: items.length }), [items]);

  const parse = () => {
    const lines = raw.split(/\r?\n/);
    const out = [];
    let year = '';
    let sectionLabel = '';
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      const upper = line.toUpperCase();
      // Year headers (FIRST YEAR, SECOND YEAR, etc.)
      if (/^(FIRST|SECOND|THIRD|FOURTH|FIFTH)\s+YEAR$/.test(upper)) { year = line; continue; }
      // SECTION : XYZ
      const sec = line.match(/^SECTION\s*:\s*(.+)$/i);
      if (sec) { sectionLabel = (sec[1] || '').trim(); continue; }
      if (upper.startsWith('SUBJECT CODE') || upper.startsWith('TOTAL')) continue;

      // Try to split columns either by tab or 2+ spaces
      let cols = line.split('\t');
      if (cols.length < 3) cols = line.split(/\s{2,}/);
      if (cols.length < 3) continue;

      // Normalize
      let [subject_code, subject_description, section_code, lec, lab, units, room, schedule] = cols;
      subject_code = (subject_code || '').replace(/^\*/,'').trim();
      subject_description = (subject_description || '').trim();
      section_code = (section_code || '').trim();
      lec = parseInt((lec || '0').trim(), 10) || 0;
      lab = parseInt((lab || '0').trim(), 10) || 0;
      units = parseInt((units || '0').trim(), 10) || 0;
      room = (room || '').trim();
      schedule = (schedule || '').trim();

      // If schedule spilled to next line(s) without columns, capture subsequent lines until blank or new header
      while (i + 1 < lines.length && lines[i + 1] && !/^SECTION\s*:/i.test(lines[i + 1]) && !/^(FIRST|SECOND|THIRD|FOURTH|FIFTH)\s+YEAR$/i.test(lines[i + 1]) && !/^SUBJECT CODE/i.test(lines[i + 1]) && !/^TOTAL/i.test(lines[i + 1]) && lines[i + 1].split(/\s{2,}|\t/).length < 3) {
        schedule = (schedule ? schedule + ' ' : '') + lines[i + 1].trim();
        i++;
      }

      const course_code = (() => {
        const sc = section_code || '';
        const m = sc.match(/^(.*)\s+\d+\s*-/);
        return (m ? m[1] : sc).trim();
      })();
      out.push({
        year_level: year || '',
        course_code,
        section_label: sectionLabel || '',
        section_code,
        subject_code,
        subject_description,
        lec, lab, units,
        room: room || null,
        schedule: schedule || null,
      });
    }
    setItems(out);
    setMessage(`Parsed ${out.length} rows`);
  };

  const importAll = async () => {
    if (items.length === 0) { setMessage('Nothing to import'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/subject-offerings/import', { items, replace });
      setMessage(`Imported ${data?.count ?? items.length} subject offerings`);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <h1>Subjects</h1>
      </div>

      <div className="form-card">
        <h2>Bulk Import Subject Offerings</h2>
        {message && <div className="alert alert-info" style={{marginTop:8}}>{message}</div>}
        <div className="module-form" style={{gap:12}}>
          <div>
            <label style={{display:'block', color:'var(--text-secondary)', fontSize:'0.9rem'}}>Paste subject offerings text</label>
            <textarea value={raw} onChange={(e)=>setRaw(e.target.value)} rows={12} style={{width:'100%'}} placeholder="Paste the subject offerings list here..." />
          </div>
          <div className="form-row" style={{gridTemplateColumns:'auto auto 1fr auto'}}>
            <label className="checkbox" style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={replace} onChange={(e)=>setReplace(e.target.checked)} />
              <span>Replace existing rows for the same Year/Course/Section</span>
            </label>
            <button type="button" className="btn btn-secondary" onClick={parse}>Parse</button>
            <div />
            <button type="button" className="btn btn-primary" disabled={loading || items.length===0} onClick={importAll}>{loading ? 'Importing…' : 'Import'}</button>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h2>Preview ({parsedStats.count})</h2>
        <div className="table-wrap" style={{maxHeight:'45vh', overflow:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Section</th>
                <th>Section Code</th>
                <th>Subject Code</th>
                <th>Description</th>
                <th>Lec</th>
                <th>Lab</th>
                <th>Units</th>
                <th>Room</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 300).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.year_level}</td>
                  <td>{it.section_label}</td>
                  <td>{it.section_code}</td>
                  <td>{it.subject_code}</td>
                  <td style={{minWidth:260}}>{it.subject_description}</td>
                  <td>{it.lec}</td>
                  <td>{it.lab}</td>
                  <td>{it.units}</td>
                  <td>{it.room || ''}</td>
                  <td style={{minWidth:260}}>{it.schedule || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length > 300 && (
          <div style={{color:'var(--text-secondary)', marginTop:8}}>Showing first 300 rows…</div>
        )}
      </div>
    </div>
  );
}
