import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await axios.delete(`/api/departments/${id}`);
      setMessage('Department deleted successfully');
      fetchDepartments();
    } catch (e) {
      setMessage('Error deleting department');
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
          <h1>Departments</h1>
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
              <input className="search-input" name="search" placeholder="Search" value={filters.search} onChange={handleFilterChange} />
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
                    <button className="btn-chip btn-edit" onClick={() => handleEdit(d)}>Edit</button>
                    <button className="btn-chip btn-delete" onClick={() => handleDelete(d.id || d.code)}>Delete</button>
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
