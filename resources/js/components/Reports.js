import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [query, setQuery] = useState('');

    const exampleReports = [
        { id: 'ex-1', report_name: 'Academic Report', report_type: 'pdf', file_type: 'PDF', file_size_mb: 2.4, generated_at: '2024-01-15T00:00:00Z', status: 'Generated' },
        { id: 'ex-2', report_name: 'Student Report', report_type: 'pdf', file_type: 'PDF', file_size_mb: 5.1, generated_at: '2024-01-10T00:00:00Z', status: 'Generated' },
        { id: 'ex-3', report_name: 'Faculty Report', report_type: 'docx', file_type: 'DOCX', file_size_mb: 1.8, generated_at: '2024-01-08T00:00:00Z', status: 'Generated' },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports');
            const data = Array.isArray(response.data) ? response.data : [];
            setReports(data.length ? data : exampleReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Fallback to example data
            setReports(exampleReports);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return 'N/A';
        try { return new Date(value).toISOString().slice(0,10); } catch { return String(value).slice(0,10); }
    };

    const typeOf = (r) => {
        const p = r.parameters || {};
        if (p.file_type) return String(p.file_type).toUpperCase();
        if (r.file_type) return r.file_type.toString().toUpperCase();
        if (p.file_ext) return String(p.file_ext).toUpperCase();
        if (r.file_path) {
            const m = r.file_path.match(/\.([a-zA-Z0-9]+)$/);
            if (m) return m[1].toUpperCase();
        }
        if (r.report_type) return String(r.report_type).toUpperCase();
        return 'FILE';
    };

    const sizeLabel = (r) => {
        const p = r.parameters || {};
        if (typeof p.file_size_mb === 'number') return `${p.file_size_mb} MB`;
        if (typeof r.file_size_mb === 'number') return `${r.file_size_mb} MB`;
        const bytes = typeof p.file_size_bytes === 'number' ? p.file_size_bytes : (typeof r.file_size_bytes === 'number' ? r.file_size_bytes : null);
        if (bytes !== null) return `${(bytes/1024/1024).toFixed(1)} MB`;
        return '—';
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reports;
        return reports.filter(r => (r.report_name||'').toLowerCase().includes(q));
    }, [query, reports]);

    const handleView = async (report) => {
        if (report.file_path) {
            window.open(report.file_path.startsWith('/') ? report.file_path : `/${report.file_path}`, '_blank');
            return;
        }
        try {
            const res = await axios.get(`/api/reports/${report.id}`);
            alert(`Report: ${res.data.report_name || report.report_name}`);
        } catch {
            alert(`Report: ${report.report_name}`);
        }
    };

    const handleDelete = async (id) => {
        if (String(id).startsWith('ex-')) {
            // Local example item
            setReports(prev => prev.filter(r => r.id !== id));
            return;
        }
        if (!confirm('Delete this report?')) return;
        try {
            await axios.delete(`/api/reports/${id}`);
            setMessage('Report deleted successfully');
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            setMessage('Error deleting report');
        }
    };

    if (loading) return <div className="loading">Loading reports...</div>;

    return (
        <div className="reports-page">
          <div className="module-page">
            <div className="page-header">
              <h1>Report</h1>
            </div>
            <p className="lead" style={{marginTop:-12, marginBottom:20, color:'var(--text-secondary)'}}>Manage archived files and documents</p>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="reports-panel">
              <div className="panel-header">
                <h2>Report</h2>
                <input
                  className="search-input"
                  placeholder="Search"
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                />
              </div>
              <div className="reports-grid">
                {filtered.map((r) => (
                  <div key={r.id} className="report-card">
                    <div className="file-icon" aria-hidden></div>
                    <div className="card-title">{r.report_name}</div>
                    <div className="card-meta">{typeOf(r)} • {sizeLabel(r)} • {formatDate(r.generated_at)}</div>
                    <div className="card-actions">
                      <button className="btn btn-primary" onClick={()=>handleView(r)}>View</button>
                      <button className="btn btn-danger" onClick={()=>handleDelete(r.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    );
}
