import React, { useMemo, useState } from 'react';
import axios from 'axios';

export default function Subjects() {
  const [raw, setRaw] = useState('');
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [replace, setReplace] = useState(true);
  const [loading, setLoading] = useState(false);
  const YEAR_LEVELS = ['FIRST YEAR','SECOND YEAR','THIRD YEAR','FOURTH YEAR','FIFTH YEAR'];
  const [browseDeptId, setBrowseDeptId] = useState('');
  const [browseDepts, setBrowseDepts] = useState([]);
  const [browseCourse, setBrowseCourse] = useState('');
  const [browseCourses, setBrowseCourses] = useState([]);
  const [browseResults, setBrowseResults] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [browseSection, setBrowseSection] = useState('');
  const [browseQuery, setBrowseQuery] = useState('');
  const CACHE_KEY = 'subject_offerings_cache';

  const SAMPLE_TEXT = `FIRST YEAR\nSECTION : A11\nSubject Code\tDescription\tSection Code\tLec\tLab\tUnits\tRoom\tSchedule\nGE 106\tArts Appreciation\tBSA 1-A11\t3\t0\t3\t\tT/F 07:30AM-09:00AM/07:30AM-09:00AM\nTOTAL\t3\t0\t3`;

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setRaw(String(ev.target?.result || '')); setMessage('Loaded text from file'); }
      catch { setMessage('Unable to read file'); }
    };
    reader.readAsText(file);
    // reset input to allow re-uploading the same file if needed
    e.target.value = '';
  };

  const useSample = () => { setRaw(SAMPLE_TEXT); setMessage('Loaded sample text'); };
  const clearAll = () => { setRaw(''); setItems([]); setMessage('Cleared'); };
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRaw(text || '');
      setMessage(text ? 'Pasted from clipboard' : 'Clipboard was empty');
    } catch {
      setMessage('Clipboard access is blocked. Paste manually (Ctrl/Cmd+V).');
    }
  };

  const parsedStats = useMemo(() => ({ count: items.length }), [items]);

  const deriveCourseCode = (s) => {
    const t = String(s || '').trim();
    const token = t.split(/[\s-]+/)[0] || '';
    return token.toUpperCase();
  };

  const loadBrowseCourses = async () => {
    try {
      const out = [];
      try {
        const rc = await axios.get('/api/courses', { params: browseDeptId ? { department_id: browseDeptId } : {} });
        const arr = Array.isArray(rc.data) ? rc.data : (Array.isArray(rc.data?.courses) ? rc.data.courses : []);
        for (const c of arr) {
          const code = String(c.code || '').toUpperCase();
          const name = String(c.name || code).toUpperCase();
          if (!code) continue;
          out.push({ code, label: `${code} - ${name}` });
        }
      } catch {
        const r2 = await axios.get('/api/settings/key/courses');
        const raw = r2.data?.setting_value;
        let list = [];
        try { list = JSON.parse(raw || '[]'); } catch { list = []; }
        const seen = new Set();
        for (const name of Array.isArray(list) ? list : []) {
          const code = deriveCourseCode(name);
          if (!code) continue;
          if (seen.has(code)) continue;
          seen.add(code);
          out.push({ code, label: `${code} - ${String(name).toUpperCase()}` });
        }
        if (out.length === 0 && items.length) {
          const codes = Array.from(new Set(items.map(i => String(i.course_code || '').toUpperCase()).filter(Boolean)));
          for (const c of codes) out.push({ code: c, label: c });
        }
      }
      out.sort((a,b)=>a.code.localeCompare(b.code));
      setBrowseCourses(out);
      if (!browseCourse && out.length) {
        const prefer = out.find(o => o.code === 'BSIT') || out[0];
        setBrowseCourse(prefer.code);
      }
    } catch { setBrowseCourses([]); }
  };

  const loadDepartments = async () => {
    try {
      const rd = await axios.get('/api/departments');
      const arr = Array.isArray(rd.data) ? rd.data : (Array.isArray(rd.data?.departments) ? rd.data.departments : []);
      const mapped = arr.map(d => ({ id: d.id, code: String(d.code || '').toUpperCase(), name: String(d.name || '').toUpperCase() }));
      setBrowseDepts(mapped);
      if (!browseDeptId && mapped.length) setBrowseDeptId(String(mapped[0].id));
    } catch {
      setBrowseDepts([]);
    }
  };

  React.useEffect(() => { loadDepartments(); }, []);
  React.useEffect(() => { loadBrowseCourses(); }, [browseDeptId]);

  // Load cached offerings for preview/browse fallback
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && items.length === 0) {
          setItems(parsed);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (browseCourse) { fetchOfferings(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseCourse]);

  // If selected course looks IT/CS-related, auto-select CSP department when available
  React.useEffect(() => {
    const code = String(browseCourse || '').toUpperCase();
    if (!code) return;
    const isIT = /^(BSIT|BSCS|BSEMC|DIT|IT|CS)/.test(code);
    if (isIT && browseDepts && browseDepts.length) {
      const csp = browseDepts.find(d => String(d.code).toUpperCase() === 'CSP');
      if (csp && String(browseDeptId) !== String(csp.id)) {
        setBrowseDeptId(String(csp.id));
      }
    }
  }, [browseCourse, browseDepts]);

  const fetchOfferings = async () => {
    if (!browseCourse) return;
    setBrowseLoading(true);
    setBrowseError('');
    try {
      const params = { course_code: browseCourse };
      if (browseQuery) params.q = browseQuery;
      const res = await axios.get('/api/offerings', { params });
      const rawArr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.items) ? res.data.items : []);
      const arr = rawArr.map((o) => ({
        year_level: o?.section?.year_level || '',
        course_code: o?.section?.course?.code || browseCourse,
        section_label: o?.section?.label || '',
        section_code: o?.section?.code || '',
        subject_code: o?.subject?.code || '',
        subject_description: o?.subject?.description || '',
        lec: o?.lec ?? 0,
        lab: o?.lab ?? 0,
        units: o?.units ?? 0,
        room: o?.room || null,
        schedule: o?.schedule || null,
      }));
      setBrowseResults(arr);
      if (arr.length === 0) setBrowseError('No subject offerings found for the selected course.');
    } catch {
      let source = items;
      if (!source || source.length === 0) {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          const parsed = JSON.parse(raw || '[]');
          if (Array.isArray(parsed)) source = parsed;
        } catch { source = []; }
      }
      const arr = source.filter(it => {
        const okCourse = String(it.course_code || '').toUpperCase() === String(browseCourse).toUpperCase();
        if (!okCourse) return false;
        if (!browseQuery) return true;
        const q = browseQuery.toLowerCase();
        return (
          String(it.subject_code || '').toLowerCase().includes(q)
          || String(it.subject_description || '').toLowerCase().includes(q)
          || String(it.section_code || '').toLowerCase().includes(q)
          || String(it.schedule || '').toLowerCase().includes(q)
        );
      });
      setBrowseResults(arr);
      if (arr.length === 0) setBrowseError('No subject offerings found. Import data first, then search again.');
    } finally {
      setBrowseLoading(false);
    }
  };

  const groupedByYear = useMemo(() => {
    const yearMap = new Map();
    const q = String(browseSection || '').trim().toUpperCase();
    for (const it of browseResults) {
      const year = String(it.year_level || '').trim();
      const section = it.section_label || it.section_code || '';
      if (q && !String(section || '').toUpperCase().includes(q)) continue;
      if (!yearMap.has(year)) yearMap.set(year, new Map());
      const secMap = yearMap.get(year);
      if (!secMap.has(section)) secMap.set(section, []);
      secMap.get(section).push(it);
    }
    const out = Array.from(yearMap.entries()).map(([yr, secMap]) => {
      const secs = Array.from(secMap.entries());
      secs.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
      return [yr, secs];
    });
    out.sort((a,b) => {
      const ay = String(a[0] || '').toUpperCase();
      const by = String(b[0] || '').toUpperCase();
      const ia = YEAR_LEVELS.indexOf(ay);
      const ib = YEAR_LEVELS.indexOf(by);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return ay.localeCompare(by);
    });
    return out;
  }, [browseResults, browseSection]);

  const resultSummary = useMemo(() => {
    let sections = 0; let subjects = 0;
    for (const [, secList] of groupedByYear) {
      sections += secList.length;
      for (const [, rows] of secList) subjects += rows.length;
    }
    return { sections, subjects };
  }, [groupedByYear]);

  const flatExport = useMemo(() => {
    return browseResults.map(it => ({
      year_level: it.year_level || '',
      course_code: it.course_code || '',
      section_label: it.section_label || '',
      section_code: it.section_code || '',
      subject_code: it.subject_code || '',
      subject_description: it.subject_description || '',
      lec: it.lec ?? 0,
      lab: it.lab ?? 0,
      units: it.units ?? 0,
      room: it.room || '',
      schedule: it.schedule || '',
    }));
  }, [browseResults]);

  const exportCSV = () => {
    if (!flatExport.length) { setMessage('Nothing to export'); return; }
    const headers = ['Year','Course','Section','Section Code','Subject Code','Description','Lec','Lab','Units','Room','Schedule'];
    const rows = flatExport.map(r => [
      r.year_level,
      r.course_code,
      r.section_label,
      r.section_code,
      r.subject_code,
      r.subject_description,
      r.lec,
      r.lab,
      r.units,
      r.room,
      r.schedule,
    ]);
    const escape = (v) => {
      const s = String(v ?? '');
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
      return s;
    };
    const csv = [headers.map(escape).join(','), ...rows.map(r=>r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offerings_${browseCourse || 'course'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printResults = () => { window.print(); };

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
      // Ignore column header tokens and totals
      if (upper.startsWith('TOTAL')) continue;
      if (upper === 'SUBJECT CODE' || upper === 'DESCRIPTION' || upper === 'SECTION CODE' || upper === 'LEC' || upper === 'LAB' || upper === 'UNITS' || upper === 'ROOM NO.' || upper === 'ROOM' || upper === 'SCHEDULE') continue;

      // Try to split columns either by tab or 2+ spaces
      let cols = line.split('\t');
      if (cols.length < 3) cols = line.split(/\s{2,}/);
      if (cols.length < 3) {
        // Attempt vertical per-field format:
        //   0: subject_code
        //   1: subject_description
        //   2: section_code
        //   3: lec
        //   4: lab
        //   5: units
        //   6: [optional room]
        //   7: schedule (or 6 if room omitted)
        if (i + 5 < lines.length) {
          const descL = (lines[i + 1] || '').trim();
          const secL = (lines[i + 2] || '').trim();
          const lecL = (lines[i + 3] || '').trim();
          const labL = (lines[i + 4] || '').trim();
          const unitsL = (lines[i + 5] || '').trim();
          const lecN = parseInt(lecL, 10);
          const labN = parseInt(labL, 10);
          const unitsN = parseInt(unitsL, 10);
          if (!Number.isNaN(lecN) && !Number.isNaN(labN) && !Number.isNaN(unitsN)) {
            let roomVal = '';
            let schedVal = '';
            let j = i + 6;
            const timeRe = /(\d{1,2}:\d{2})\s*(AM|PM)/i;
            if (j < lines.length) {
              const maybe = (lines[j] || '').trim();
              if (maybe && (timeRe.test(maybe) || /[MTWFS]|TH|\//i.test(maybe))) {
                schedVal = maybe;
              } else if (maybe) {
                roomVal = maybe;
                if (j + 1 < lines.length) {
                  const maybe2 = (lines[j + 1] || '').trim();
                  if (timeRe.test(maybe2) || /[MTWFS]|TH|\//i.test(maybe2)) {
                    schedVal = maybe2;
                    j++;
                  }
                }
              }
            }
            const section_code = secL;
            const subject_code = line.replace(/^\*/, '').trim();
            const subject_description = descL;
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
              lec: lecN, lab: labN, units: unitsN,
              room: roomVal || null,
              schedule: schedVal || null,
            });
            i = j; // advance to the last consumed line of this record
            continue;
          }
        }
        continue;
      }

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
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(out)); } catch {}
    setMessage(`Parsed ${out.length} rows`);
  };

  const importAll = async () => {
    if (items.length === 0) { setMessage('Nothing to import'); return; }
    setLoading(true);
    try {
      let data;
      try {
        ({ data } = await axios.post('/api/offerings/import', { items, replace }));
      } catch (err) {
        ({ data } = await axios.post('/api/subject-offerings/import', { items, replace }));
      }
      setMessage(`Imported ${data?.count ?? items.length} subject offerings`);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-page subjects-page">
      <div className="module-page subjects-page">
        <div className="page-header">
          <h1>Subjects</h1>
        </div>

        <div className="form-card">
          <h2>Browse Subject Offerings</h2>
          <div className="module-form sticky subjects-filters">
            <div className="form-row layout-search-over">
              <div className="field-dept">
                <label>Department</label>
                <select value={browseDeptId} onChange={(e)=>setBrowseDeptId(e.target.value)}>
                  {browseDepts.map(d => (<option key={d.id} value={d.id}>{`${d.code} - ${d.name}`}</option>))}
                </select>
              </div>
              <div className="field-course">
                <label>Course</label>
                <select value={browseCourse} onChange={(e)=>setBrowseCourse(e.target.value)}>
                  {browseCourses.map(opt => (<option key={opt.code} value={opt.code}>{opt.label}</option>))}
                </select>
              </div>
              <div className="field-section">
                <label>Section (optional)</label>
                <input placeholder="e.g., IT11" value={browseSection} onChange={(e)=>setBrowseSection(e.target.value)} />
              </div>
              <div className="field-search">
                <label>Search</label>
                <input placeholder="Search" value={browseQuery} onChange={(e)=>setBrowseQuery(e.target.value)} />
              </div>
            </div>
            <div className="form-actions" style={{justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={exportCSV} disabled={!browseResults.length}>Export CSV</button>
              <button type="button" className="btn btn-secondary" onClick={printResults} disabled={!browseResults.length}>Print</button>
              <button type="button" className="btn btn-primary" onClick={fetchOfferings} disabled={!browseCourse || browseLoading}>{browseLoading ? 'Loading…' : 'View Sections'}</button>
            </div>
          </div>
          {browseError && <div className="alert alert-info" style={{marginTop:8}}>{browseError}</div>}
          </div>
          {browseLoading && (
            <div className="table-card" style={{padding:'16px'}}>
              <div className="skeleton-row" style={{height:12, background:'var(--bg-secondary)', marginBottom:8, borderRadius:6}} />
              <div className="skeleton-row" style={{height:12, background:'var(--bg-secondary)', marginBottom:8, borderRadius:6, width:'80%'}} />
              <div className="skeleton-row" style={{height:12, background:'var(--bg-secondary)', marginBottom:8, borderRadius:6, width:'60%'}} />
            </div>
          )}
          {!browseLoading && groupedByYear.length === 0 && (
            <div className="table-card" style={{textAlign:'center', padding:'24px'}}>
              <div style={{fontWeight:600, marginBottom:6}}>No offerings yet</div>
              <div style={{color:'var(--text-secondary)'}}>Select a course or adjust filters to view subject offerings.</div>
            </div>
          )}
          {!browseLoading && groupedByYear.length > 0 && (
            <div style={{marginTop: '12px'}}>
              <div className="page-header summary-bar">
                <h2>{browseCourse} • {resultSummary.sections} sections • {resultSummary.subjects} subjects</h2>
              </div>
              {groupedByYear.map(([yr, sections]) => (
                <div key={String(yr)} className="table-card" style={{marginBottom:'16px'}}>
                  <div className="page-header year-header">
                    <h2>{String(yr || '').toUpperCase()}</h2>
                  </div>
                  {sections.map(([section, rows]) => {
                    const totals = rows.reduce((acc, r) => {
                      acc.lec += Number(r.lec || 0);
                      acc.lab += Number(r.lab || 0);
                      acc.units += Number(r.units || 0);
                      return acc;
                    }, { lec: 0, lab: 0, units: 0 });
                    return (
                      <div key={section} style={{marginTop:'8px'}}>
                        <div className="page-header section-header">
                          <h2>Section: {section}</h2>
                        </div>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Subject Code</th>
                              <th>Description</th>
                              <th>Section Code</th>
                              <th>Lec</th>
                              <th>Lab</th>
                              <th>Units</th>
                              <th>Room No.</th>
                              <th>Schedule</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((it, idx) => (
                              <tr key={section + '-' + idx}>
                                <td>{it.subject_code}</td>
                                <td style={{minWidth:260}}>{it.subject_description}</td>
                                <td>{it.section_code}</td>
                                <td>{it.lec}</td>
                                <td>{it.lab}</td>
                                <td>{it.units}</td>
                                <td>{it.room || ''}</td>
                                <td style={{minWidth:260}}>{it.schedule || ''}</td>
                              </tr>
                            ))}
                            <tr>
                              <td><strong>TOTAL</strong></td>
                              <td></td>
                              <td></td>
                              <td><strong>{totals.lec}</strong></td>
                              <td><strong>{totals.lab}</strong></td>
                              <td><strong>{totals.units}</strong></td>
                              <td></td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}


      </div>
    </div>
  );
}
