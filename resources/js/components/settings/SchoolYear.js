import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function SchoolYear() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', start_date: '', end_date: '', status: 'Active' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ label: '', start_date: '', end_date: '', status: 'Active' });

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchYears = async () => {
    try {
      const res = await axios.get('/api/school-years');
      setYears(res.data || []);
    } catch (e) {
      console.error('Failed to load school years', e);
      setMessage('Error loading school years');
    } finally {
      setLoading(false);
    }
  };

  const current = useMemo(() => {
    if (!years.length) return null;
    const actives = years.filter(y => (y.status || '').toLowerCase() === 'active');
    const byStart = [...actives].sort((a, b) => new Date(b.start_date || '1970-01-01') - new Date(a.start_date || '1970-01-01'));
    const y = byStart[0] || years[0];
    return {
      label: y.label,
      stats: {
        semesters: y.semesters_count || (y.semesters ? y.semesters.length : 0) || 0,
        students: y.students_count || 0,
        faculty: 0,
        courses: 0,
      },
    };
  }, [years]);

  const startEdit = (y) => {
    setEditingId(y.id);
    setEditForm({
      label: y.label || '',
      start_date: y.start_date ? String(y.start_date).slice(0, 10) : '',
      end_date: y.end_date ? String(y.end_date).slice(0, 10) : '',
      status: y.status || 'Active',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/api/school-years/${id}`, editForm);
      setMessage('School year updated');
      setEditingId(null);
      fetchYears();
    } catch (e) {
      console.error('Failed to update', e);
      setMessage(e.response?.data?.message || 'Error updating');
    }
  };

  const archiveYear = async (id) => {
    if (!confirm('Archive this school year?')) return;
    try {
      await axios.post(`/api/school-years/${id}/archive`);
      setMessage('Archived successfully');
      fetchYears();
    } catch (e) {
      console.error('Archive failed', e);
      setMessage('Archive failed');
    }
  };

  const unarchiveYear = async (id) => {
    try {
      await axios.post(`/api/school-years/${id}/unarchive`);
      setMessage('Unarchived successfully');
      fetchYears();
    } catch (e) {
      console.error('Unarchive failed', e);
      setMessage('Unarchive failed');
    }
  };

  const createYear = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/school-years', createForm);
      setMessage('School year created');
      setShowCreate(false);
      setCreateForm({ label: '', start_date: '', end_date: '', status: 'Active' });
      fetchYears();
    } catch (err) {
      console.error('Create failed', err);
      setMessage(err.response?.data?.message || 'Error creating school year');
    }
  };

  const Stat = ({ value, label }) => (
    <div className="sy-stat">
      <div className="value">{value.toLocaleString()}</div>
      <div className="label">{label}</div>
    </div>
  );

  const StatusBadge = ({ status, children }) => (
    <span className={`status-badge ${status.toLowerCase()}`}>{children || status}</span>
  );

  return (
    <div className="module-page school-year-page">
      <div className="page-header">
        <div>
          <h1>School Year Management</h1>
          <p className="page-subtitle">Manage academic school years and their configurations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ Add School Year'}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <div className="loading">Loading...</div>}

      {showCreate && (
        <div className="sy-card" style={{ marginBottom: '16px' }}>
          <h2 style={{ marginTop: 0 }}>Add School Year</h2>
          <form className="module-form" onSubmit={createYear}>
            <div className="form-row">
              <input
                name="label"
                placeholder="Label (e.g., 2024–2025)"
                value={createForm.label}
                onChange={(e)=>setCreateForm({ ...createForm, label: e.target.value })}
                required
              />
              <input
                type="date"
                name="start_date"
                placeholder="Start Date"
                value={createForm.start_date}
                onChange={(e)=>setCreateForm({ ...createForm, start_date: e.target.value })}
              />
              <input
                type="date"
                name="end_date"
                placeholder="End Date"
                value={createForm.end_date}
                onChange={(e)=>setCreateForm({ ...createForm, end_date: e.target.value })}
              />
            </div>
            <div className="form-row">
              <select
                name="status"
                value={createForm.status}
                onChange={(e)=>setCreateForm({ ...createForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Current Academic Year Summary */}
      {current && (
        <div className="sy-card current-year">
          <div className="sy-card-header">
            <h2>Current Academic Year</h2>
            <StatusBadge status="active">{current.label}</StatusBadge>
          </div>
          <div className="stats-grid">
            <Stat value={current.stats.semesters} label="Total Semesters" />
            <Stat value={current.stats.students} label="Total Students" />
            <Stat value={current.stats.faculty} label="Total Faculty" />
            <Stat value={current.stats.courses} label="Total Courses" />
          </div>
        </div>
      )}

      {/* School Year Management List */}
      <div className="sy-section">
        <h3>School Year Management</h3>

        {years.map((y) => (
          <div key={y.id || y.label} className="sy-year-card">
            <div className="sy-year-header">
              <div className="title-row">
                <h4>{y.label}</h4>
                <StatusBadge status={y.status}>{y.status}</StatusBadge>
              </div>
              <div className="meta-grid">
                <div>
                  <div className="meta-label">Start Date</div>
                  <div className="meta-value">{y.start_date ? new Date(y.start_date).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div className="meta-label">End Date</div>
                  <div className="meta-value">{y.end_date ? new Date(y.end_date).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div className="meta-label">Total Students</div>
                  <div className="meta-value">{(y.students_count || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="meta-label">Total Faculty</div>
                  <div className="meta-value">{0}</div>
                </div>
                <div>
                  <div className="meta-label">Total Courses</div>
                  <div className="meta-value">{0}</div>
                </div>
              </div>
            </div>

            <div className="sy-semesters">
              <div className="section-title">Semesters</div>
              <div className="semester-list">
                {(y.semesters || []).map((s) => (
                  <div key={s.id || s.name} className="semester-item">
                    <div className="sem-name">{s.name}</div>
                    <div className="sem-range">{`${s.start_date ? new Date(s.start_date).toLocaleDateString() : '-'} — ${s.end_date ? new Date(s.end_date).toLocaleDateString() : '-'}`}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sy-actions">
              {editingId === y.id ? (
                <>
                  <button className="btn btn-primary" onClick={() => saveEdit(y.id)}>Save</button>
                  <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => startEdit(y)}>Edit</button>
                  {String(y.status).toLowerCase() === 'archived' ? (
                    <button className="btn" onClick={() => unarchiveYear(y.id)}>Unarchive</button>
                  ) : (
                    <button className="btn btn-danger" onClick={() => archiveYear(y.id)}>Archive</button>
                  )}
                </>
              )}
            </div>

            {editingId === y.id && (
              <div className="form-card" style={{marginTop: '12px'}}>
                <h2>Edit School Year</h2>
                <form className="module-form" onSubmit={(e) => { e.preventDefault(); saveEdit(y.id); }}>
                  <div className="form-row">
                    <input name="label" placeholder="Label (e.g., 2024–2025)" value={editForm.label} onChange={(e)=>setEditForm({...editForm, label: e.target.value})} required />
                    <input type="date" name="start_date" placeholder="Start Date" value={editForm.start_date} onChange={(e)=>setEditForm({...editForm, start_date: e.target.value})} />
                    <input type="date" name="end_date" placeholder="End Date" value={editForm.end_date} onChange={(e)=>setEditForm({...editForm, end_date: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <select name="status" value={editForm.status} onChange={(e)=>setEditForm({...editForm, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
