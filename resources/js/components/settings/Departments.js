import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiArchive } from 'react-icons/fi';

export default function Departments() {
  const DEFAULT_DEPARTMENTS = [
    { code: 'CSP', name: 'Computer Science Program' },
    { code: 'AP', name: 'Accountancy Program' },
    { code: 'BAP', name: 'Business Administration Program' },
    { code: 'NP', name: 'Nursing Program' },
    { code: 'ICJ', name: 'Criminology Program' },
    { code: 'TEP', name: 'Teacher Education Program' },
    { code: 'ETP', name: 'Engineering Program' },
  ];
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [stats, setStats] = useState({ faculty: 0, students: 0, semesters: 0 });
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ search: '', status: '' });
  const [formData, setFormData] = useState({ code: '', name: '', chair: '', email: '', status: 'Active' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(Array.isArray(res.data) ? res.data : (res.data?.departments || []));
    } catch (e) {
      setMessage('Departments API not available. Using empty list.');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (code) => {
    if (!code) {
      setStats({ faculty: 0, students: 0, semesters: 0 });
      return;
    }
    try {
      const [facRes, stuRes, yearsRes] = await Promise.all([
        axios.get('/api/faculties', { params: { department: code } }),
        axios.get('/api/students', { params: { department: code } }),
        axios.get('/api/school-years'),
      ]);
      const facultyCount = Array.isArray(facRes.data) ? facRes.data.length : 0;
      const studentCount = Array.isArray(stuRes.data) ? stuRes.data.length : 0;
      const years = Array.isArray(yearsRes.data) ? yearsRes.data : [];
      const activeSemesters = years
        .filter(y => String(y.status || '').toLowerCase() === 'active')
        .reduce((sum, y) => sum + (y.semesters_count || (Array.isArray(y.semesters) ? y.semesters.length : 0) || 0), 0);
      setStats({ faculty: facultyCount, students: studentCount, semesters: activeSemesters });
    } catch (_) {
      setStats({ faculty: 0, students: 0, semesters: 0 });
    }
  };

  useEffect(() => {
    fetchStats(selectedDept);
  }, [selectedDept]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const st = filters.status;
    return departments.filter(d => {
      const okSearch = q
        ? (String(d.code || '').toLowerCase().includes(q)
           || String(d.name || '').toLowerCase().includes(q)
           || String(d.chair || '').toLowerCase().includes(q)
           || String(d.email || '').toLowerCase().includes(q))
        : true;
      const okStatus = st ? String(d.status || 'Active') === st : true;
      return okSearch && okStatus;
    });
  }, [departments, filters]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ code: '', name: '', chair: '', email: '', status: 'Active' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (dept) => {
    setFormData({ code: dept.code || '', name: dept.name || '', chair: dept.chair || '', email: dept.email || '', status: dept.status || 'Active' });
    setEditingId(dept.id || dept.code || null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/departments/${editingId}`, formData);
        setMessage('Department updated successfully');
      } else {
        await axios.post('/api/departments', formData);
        setMessage('Department created successfully');
      }
      await fetchDepartments();
      resetForm();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error saving department');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this department? It will be moved to archives.')) return;
    try {
      await axios.post(`/api/departments/${id}/archive`);
      setMessage('Department archived successfully');
      fetchDepartments();
    } catch (e) {
      setMessage('Error archiving department');
    }
  };

  const importDefaults = async () => {
    if (!confirm('Import default departments? This will add any missing departments.')) return;
    try {
      // build a set of existing codes
      const existing = new Set(departments.map(d => String(d.code).toUpperCase()));
      const toCreate = DEFAULT_DEPARTMENTS.filter(d => !existing.has(d.code.toUpperCase()));
      for (const dept of toCreate) {
        await axios.post('/api/departments', { code: dept.code, name: dept.name, status: 'Active' });
      }
      if (toCreate.length === 0) {
        setMessage('All default departments already exist.');
      } else {
        setMessage(`Imported ${toCreate.length} departments.`);
      }
      await fetchDepartments();
    } catch (e) {
      console.error('Failed to import defaults', e);
      setMessage('Failed to import default departments');
    }
  };

  if (loading) return <div className="loading">Loading departments...</div>;

  return (
    <div className="students-page">
      <div className="module-page">
        <div className="page-header">
          <div style={{display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap'}}>
            <h1 style={{margin:0}}>Departments</h1>
            <div className="header-filter">
              <label className="label" htmlFor="deptPicker">Select Department</label>
              <div className="select-with-icon">
                <select id="deptPicker" value={selectedDept} onChange={(e)=>{ const v = e.target.value; setSelectedDept(v); if (v) navigate(`/settings/departments/${encodeURIComponent(v)}`); }}>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id || d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
          <div style={{display:'flex', gap: '8px', alignItems: 'center'}}>
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>{showForm ? 'Cancel' : '+ Add Department'}</button>
            <button className="btn btn-secondary" onClick={importDefaults}>Import Default Departments</button>
          </div>
        </div>

        {message && <div className="alert alert-info">{message}</div>}


        <div className="students-panel">
          <div className="panel-header">
            <h2>Department Management</h2>
            <div className="panel-controls">
              <div className="input-with-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search-input"
                  name="search"
                  type="search"
                  aria-label="Search departments"
                  placeholder="Search departments"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filters">
                <select className="filter" name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Any Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingId ? 'Edit Department' : 'Add Department'}</h2>
            <form onSubmit={handleSubmit} className="module-form">
              <div className="form-row">
                <input name="code" placeholder="Code *" value={formData.code} onChange={handleChange} required data-uppercase="true" />
                <input name="name" placeholder="Name *" value={formData.name} onChange={handleChange} required />
                <input name="chair" placeholder="Chair" value={formData.chair} onChange={handleChange} />
              </div>
              <div className="form-row">
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Department</button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Chair</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={d.id || d.code || idx}>
                  <td>{d.code}</td>
                  <td>{d.name}</td>
                  <td>{d.chair || ''}</td>
                  <td>{d.email || ''}</td>
                  <td><span className={`badge badge-${String(d.status || 'Active').toLowerCase().replace(' ', '-')}`}>{d.status || 'Active'}</span></td>
                  <td className="actions">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(d)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon btn-archive" onClick={() => handleArchive(d.id || d.code)} title="Archive">
                      <FiArchive />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
