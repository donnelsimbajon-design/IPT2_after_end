import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { HiDownload, HiSave, HiX, HiUsers, HiAcademicCap, HiOfficeBuilding, HiCalendar, HiUserGroup, HiCheckCircle } from 'react-icons/hi';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [query, setQuery] = useState('');

    // Generator state
    const [mode, setMode] = useState('students_by_course'); // 'students_by_course' | 'faculty_by_department'
    const [filters, setFilters] = useState({ 
        course: '', 
        department: '', 
        year_level: '', 
        status: 'Active',
        position: '',
        employment_type: ''
    });
    const [filterOptions, setFilterOptions] = useState({
        courses: [],
        departments: [],
        year_levels: [],
        student_statuses: [],
        faculty_statuses: [],
        positions: [],
        employment_types: []
    });
    const [genLoading, setGenLoading] = useState(false);
    const [generated, setGenerated] = useState(null); // Will hold {students/faculty, summary}
    const [showModal, setShowModal] = useState(false);
    const [localFiles, setLocalFiles] = useState([]);
    const localFilesRef = useRef(localFiles);
    useEffect(()=>{ localFilesRef.current = localFiles; }, [localFiles]);

    const exampleReports = [
        { id: 'ex-1', report_name: 'Academic Report', report_type: 'pdf', file_type: 'PDF', file_size_mb: 2.4, generated_at: '2024-01-15T00:00:00Z', status: 'Generated' },
        { id: 'ex-2', report_name: 'Student Report', report_type: 'pdf', file_type: 'PDF', file_size_mb: 5.1, generated_at: '2024-01-10T00:00:00Z', status: 'Generated' },
        { id: 'ex-3', report_name: 'Faculty Report', report_type: 'docx', file_type: 'DOCX', file_size_mb: 1.8, generated_at: '2024-01-08T00:00:00Z', status: 'Generated' },
    ];

    const exampleStudents = [
        { id: 's-1', student_id: 'STU-1001', first_name: 'Alice', last_name: 'Reyes', email: 'alice.reyes@example.com', department: 'CSP', program: 'CSP', course: 'BSCS', year_level: '3', status: 'Active' },
        { id: 's-2', student_id: 'STU-1002', first_name: 'Ben', last_name: 'Santos', email: 'ben.santos@example.com', department: 'AP', program: 'AP', course: 'BSA', year_level: '2', status: 'Active' },
        { id: 's-3', student_id: 'STU-1003', first_name: 'Chloe', last_name: 'Garcia', email: 'chloe.garcia@example.com', department: 'CSP', program: 'CSP', course: 'BSCS', year_level: '1', status: 'Inactive' },
        { id: 's-4', student_id: 'STU-1004', first_name: 'Diego', last_name: 'Lim', email: 'diego.lim@example.com', department: 'ETP', program: 'ETP', course: 'BSEE', year_level: '4', status: 'Active' },
    ];

    const exampleFaculty = [
        { id: 'f-1', faculty_id: 'FAC-2101', first_name: 'Erika', last_name: 'Mendoza', email: 'erika.mendoza@example.com', department: 'CSP', position: 'Assistant Professor', employment_type: 'Full-time', status: 'Active' },
        { id: 'f-2', faculty_id: 'FAC-2102', first_name: 'Felix', last_name: 'Uy', email: 'felix.uy@example.com', department: 'AP', position: 'Lecturer', employment_type: 'Part-time', status: 'Inactive' },
        { id: 'f-3', faculty_id: 'FAC-2103', first_name: 'Grace', last_name: 'Tan', email: 'grace.tan@example.com', department: 'ETP', position: 'Associate Professor', employment_type: 'Full-time', status: 'Active' },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        const id = setInterval(() => { fetchReports(); }, 5000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        // Load filter options from the new API endpoint
        const load = async () => {
            try {
                const response = await axios.get('/api/reports/filter-options');
                if (response.data) {
                    setFilterOptions({
                        courses: response.data.courses || [],
                        departments: response.data.departments || [],
                        year_levels: response.data.year_levels || [],
                        student_statuses: response.data.student_statuses || [],
                        faculty_statuses: response.data.faculty_statuses || [],
                        positions: response.data.positions || [],
                        employment_types: response.data.employment_types || []
                    });
                }
            } catch (error) {
                console.error('Error loading filter options:', error);
                // Fallback to empty arrays
                setFilterOptions({
                    courses: [],
                    departments: [],
                    year_levels: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
                    student_statuses: ['Active', 'Inactive'],
                    faculty_statuses: ['Active', 'Inactive'],
                    positions: [],
                    employment_types: []
                });
            }
        };
        load();
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
            const base = data.length ? data : exampleReports;
            setReports([...(localFilesRef.current || []), ...base]);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Fallback to example data
            setReports([...(localFilesRef.current || []), ...exampleReports]);
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
        // Removed: if (r.report_type) return String(r.report_type).toUpperCase();
        // This was displaying "STUDENTS_BY_COURSE" instead of file type
        return 'PDF';
    };

    const sizeLabel = (r) => {
        const p = r.parameters || {};
        if (typeof p.file_size_mb === 'number') return `${p.file_size_mb} MB`;
        if (typeof r.file_size_mb === 'number') return `${r.file_size_mb} MB`;
        const bytes = typeof p.file_size_bytes === 'number' ? p.file_size_bytes : (typeof r.file_size_bytes === 'number' ? r.file_size_bytes : null);
        if (bytes !== null) return `${(bytes/1024/1024).toFixed(1)} MB`;
        return '—';
    };

    const statusOf = (r) => {
        const p = r.parameters || {};
        return r.status || p.status || 'Generated';
    };
    const statusClass = (s) => {
        const n = String(s || '').toLowerCase().replace(/\s+/g,'-');
        const known = ['active','inactive','generated','archived','suspended','on-leave'];
        return 'badge' + (known.includes(n) ? ` badge-${n}` : '');
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reports;
        return reports.filter(r => (r.report_name||'').toLowerCase().includes(q));
    }, [query, reports]);

    const activeReports = useMemo(() => {
        return reports.filter(r => {
            const s = String(statusOf(r)).toLowerCase();
            return ['pending','processing','generating','in progress','queued','building'].includes(s);
        });
    }, [reports]);

    const handleGenerate = async () => {
        setGenLoading(true);
        setGenerated(null);
        
        try {
            // Build parameters object with only non-empty filters
            const parameters = {};
            
            if (mode === 'students_by_course') {
                if (filters.course) parameters.course = filters.course;
                if (filters.year_level) parameters.year_level = filters.year_level;
                if (filters.status) parameters.status = filters.status;
            } else if (mode === 'faculty_by_department') {
                if (filters.department) parameters.department = filters.department;
                if (filters.position) parameters.position = filters.position;
                if (filters.employment_type) parameters.employment_type = filters.employment_type;
                if (filters.status) parameters.status = filters.status;
            }
            
            // Call the generate report API
            const response = await axios.post('/api/reports/generate', {
                report_type: mode,
                report_name: mode === 'students_by_course' 
                    ? `Students Report - ${filters.course || 'All Courses'}`
                    : `Faculty Report - ${filters.department || 'All Departments'}`,
                description: `Generated on ${new Date().toLocaleDateString()}`,
                parameters: parameters
            });
            
            if (response.data && response.data.data) {
                setGenerated(response.data.data);
                setShowModal(true); // Show modal with results
                setMessage('Report generated successfully');
                // Refresh the reports list
                fetchReports();
            }
        } catch (error) {
            console.error('Error generating report:', error);
            setMessage('Failed to generate report');
            
            // Fallback to example data
            if (mode === 'students_by_course') {
                let arr = exampleStudents;
                if (filters.course) {
                    arr = arr.filter(s => String(s.course || '').toLowerCase() === String(filters.course).toLowerCase());
                }
                setGenerated({ students: arr, summary: { total_students: arr.length } });
                setShowModal(true);
            } else {
                let arr = exampleFaculty;
                if (filters.department) {
                    arr = arr.filter(f => String(f.department || '').toLowerCase() === String(filters.department).toLowerCase());
                }
                setGenerated({ faculty: arr, summary: { total_faculty: arr.length } });
                setShowModal(true);
            }
        } finally {
            setGenLoading(false);
        }
    };

    const exportCsv = () => {
        if (!generated) return;
        
        const items = generated.students || generated.faculty || [];
        if (!items.length) return;
        
        const escape = (v) => `"${String(v ?? '').replace(/"/g,'""')}"`;
        let headers = [];
        let rows = [];
        
        const isStudents = mode === 'students_by_course';
        
        if (isStudents) {
            headers = ['Student ID','First Name','Last Name','Email','Department','Course','Year Level','Status'];
            rows = items.map(s => [s.student_id, s.first_name, s.last_name, s.email, s.department || s.program, s.course, s.year_level, s.status || 'Active']);
        } else {
            headers = ['Faculty ID','First Name','Last Name','Email','Department','Position','Employment Type','Status'];
            rows = items.map(f => [f.faculty_id, f.first_name, f.last_name, f.email, f.department, f.position, f.employment_type, f.status || 'Active']);
        }
        
        const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const when = new Date();
        const ts = `${when.getFullYear()}-${String(when.getMonth()+1).padStart(2,'0')}-${String(when.getDate()).padStart(2,'0')}`;
        a.href = url;
        a.download = `${isStudents ? 'students' : 'faculty'}-report-${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleView = async (report) => {
        // Download the report file
        if (report.file_path) {
            // If it's a local blob URL, open it in a new tab to print/save
            if (report.file_path.startsWith('blob:')) {
                window.open(report.file_path, '_blank');
                return;
            }
            // Otherwise download it
            const a = document.createElement('a');
            a.href = report.file_path.startsWith('/') ? report.file_path : `/${report.file_path}`;
            a.download = report.report_name || 'report';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }
        
        // If no file path, download via API
        try {
            const response = await axios.get(`/api/reports/${report.id}/download`, {
                responseType: 'blob'
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from content-disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = report.report_name || 'report';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setMessage('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            setMessage('Error downloading report');
        }
    };

    const handleDelete = async (id) => {
        if (String(id).startsWith('ex-') || String(id).startsWith('local-')) {
            // Local example or local generated item
            setReports(prev => prev.filter(r => r.id !== id));
            if (String(id).startsWith('local-')) {
              setLocalFiles(prev => prev.filter(r => r.id !== id));
            }
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

    const saveReport = () => {
        if (!generated) return;
        
        const items = generated.students || generated.faculty || [];
        if (!items.length) return;
        
        const isStudents = mode === 'students_by_course';
        const title = isStudents ? 'Student Report' : 'Faculty Report';
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        // Build printable HTML that looks like a PDF
        const tableHead = isStudents
          ? ['Student ID','First Name','Last Name','Email','Department','Course','Year Level','Status']
          : ['Faculty ID','First Name','Last Name','Email','Department','Position','Employment Type','Status'];
        const tableRows = items.map(row => (
          isStudents
            ? [row.student_id, row.first_name, row.last_name, row.email, (row.department || row.program || ''), row.course, row.year_level, (row.status || 'Active')]
            : [row.faculty_id, row.first_name, row.last_name, row.email, row.department, row.position, row.employment_type, (row.status || 'Active')]
        ));
        
        const logoTitle = 'Institution Name';
        const filterLabel = isStudents 
            ? (filters.course ? `Course: ${filters.course}` : 'All Courses')
            : (filters.department ? `Department: ${filters.department}` : 'All Departments');
        
        // Add summary section if available
        const summaryHtml = generated.summary ? `
          <div class="summary-section">
            <h3>Summary</h3>
            <div class="summary-stats">
              <div>Total: ${generated.summary.total_students || generated.summary.total_faculty || items.length}</div>
              ${generated.summary.by_year_level ? `<div>By Year: ${JSON.stringify(generated.summary.by_year_level)}</div>` : ''}
              ${generated.summary.by_position ? `<div>By Position: ${JSON.stringify(generated.summary.by_position)}</div>` : ''}
              ${generated.summary.by_gender ? `<div>By Gender: ${JSON.stringify(generated.summary.by_gender)}</div>` : ''}
            </div>
          </div>
        ` : '';
        
        const styles = `
          <style>
            :root { color-scheme: light dark; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; margin: 24px; color: #e6e6e6; background: #0f172a; }
            .sheet { background: #0b1221; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 24px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .brand { font-weight: 800; letter-spacing: .3px; font-size: 18px; }
            .title { font-size: 22px; font-weight: 800; margin: 0; }
            .meta { color: #a1a1aa; font-size: 13px; }
            .summary-section { margin: 16px 0; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; }
            .summary-section h3 { margin: 0 0 8px 0; font-size: 16px; }
            .summary-stats { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 10px; }
            tbody td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px; }
            tbody tr:nth-child(odd) { background: rgba(255,255,255,0.02); }
            .footer { margin-top: 16px; color: #94a3b8; font-size: 12px; display: flex; justify-content: space-between; }
            @media print { body { background: white; color: black; } .sheet { border: 0; border-radius: 0; } thead th { color: #333; border-color: #ddd; } tbody td { border-color: #eee; } }
          </style>
        `;
        const thead = `<thead><tr>${tableHead.map(h=>`<th>${String(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${tableRows.map(r=>`<tr>${r.map(c=>`<td>${String(c ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
        const html = `<!doctype html><html><head><meta charset="utf-8"/>${styles}<title>${title}</title></head><body>
          <div class="sheet">
            <div class="header">
              <div>
                <div class="brand">${logoTitle}</div>
                <h1 class="title">${title}</h1>
                <div class="meta">${filterLabel}</div>
              </div>
              <div class="meta">Generated: ${dateStr}</div>
            </div>
            ${summaryHtml}
            <table>${thead}${tbody}</table>
            <div class="footer"><span>Prepared by: ____________________</span><span>Signature: ____________________</span></div>
          </div>
        </body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const item = {
          id: `local-${now.getTime()}`,
          report_name: title,
          report_type: 'pdf',
          file_type: 'PDF',
          file_size_bytes: blob.size,
          generated_at: now.toISOString(),
          status: 'Generated',
          file_path: url,
        };
        setLocalFiles(prev => [item, ...prev]);
        setReports(prev => [item, ...prev]);
        setMessage('Report saved to files');
    };

    if (loading) return (
        <div className="reports-page">
            <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading reports...</p>
            </div>
        </div>
    );

    return (
        <div className="reports-page modern-minimalist">
          <div className="module-page">
            <div className="page-header-modern">
              <div className="header-content">
                <h1>Reports</h1>
                <p className="subtitle">Generate and manage reports</p>
              </div>
              <div className="header-stats">
                <div className="stat-card">
                  <div className="stat-value">{reports.length}</div>
                  <div className="stat-label">Total Files</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{activeReports.length}</div>
                  <div className="stat-label">Generating</div>
                </div>
              </div>
            </div>

            {message && (
                <div className="alert-modern alert-success">
                    <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>{message}</span>
                </div>
            )}
            {activeReports.length > 0 && (
              <div className="alert-modern alert-info">
                <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>{activeReports.length} report{activeReports.length>1?'s':''} generating…</span>
              </div>
            )}

            {/* Modal for Generated Report */}
            {showModal && generated && (
              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="header-left">
                      <HiAcademicCap className="header-icon" />
                      <div className="header-text">
                        <h2>Report Results</h2>
                        <p className="header-subtitle">{mode === 'students_by_course' ? 'Students Report' : 'Faculty Report'}</p>
                      </div>
                      <span className="result-count">{(generated.students || generated.faculty || []).length}</span>
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-export" onClick={exportCsv}>
                        <HiDownload />
                        <span>Export CSV</span>
                      </button>
                      <button className="btn btn-save" onClick={saveReport}>
                        <HiSave />
                        <span>Save Report</span>
                      </button>
                      <button className="modal-close" onClick={() => setShowModal(false)}>
                        <HiX />
                      </button>
                    </div>
                  </div>
                  
                  <div className="modal-body">
                    {/* Summary Section - Horizontal Layout */}
                    {generated.summary && (
                      <div className="modal-left">
                        <div className="summary-content">
                          {/* Count Stat */}
                          <div className="summary-stat">
                            <div className="stat-icon">
                              <HiUsers />
                            </div>
                            <div className="stat-details">
                              <div className="stat-value">{generated.summary.total_students || generated.summary.total_faculty || 0}</div>
                              <h3>TOTAL COUNT</h3>
                              <div className="count">{mode === 'students_by_course' ? 'Students' : 'Faculty'}</div>
                            </div>
                          </div>
                          
                          {/* Filter Badges */}
                          <div className="summary-filters">
                            {generated.summary.course && (
                              <div className="filter-badge">
                                <strong>Course:</strong> <span>{generated.summary.course}</span>
                              </div>
                            )}
                            {generated.summary.department && (
                              <div className="filter-badge">
                                <strong>Department:</strong> <span>{generated.summary.department}</span>
                              </div>
                            )}
                            {generated.summary.by_year_level && Object.keys(generated.summary.by_year_level).length > 0 && (
                              <div className="filter-badge">
                                <strong>By Year:</strong> <span>{Object.entries(generated.summary.by_year_level).map(([key, val]) => `${key}: ${val}`).join(', ')}</span>
                              </div>
                            )}
                            {generated.summary.by_position && Object.keys(generated.summary.by_position).length > 0 && (
                              <div className="filter-badge">
                                <strong>By Position:</strong> <span>{Object.entries(generated.summary.by_position).map(([key, val]) => `${key}: ${val}`).join(', ')}</span>
                              </div>
                            )}
                            {generated.summary.by_gender && Object.keys(generated.summary.by_gender).length > 0 && (
                              <div className="filter-badge">
                                <strong>By Gender:</strong> <span>{Object.entries(generated.summary.by_gender).map(([key, val]) => `${key}: ${val}`).join(', ')}</span>
                              </div>
                            )}
                            {generated.summary.by_employment_type && Object.keys(generated.summary.by_employment_type).length > 0 && (
                              <div className="filter-badge">
                                <strong>By Employment:</strong> <span>{Object.entries(generated.summary.by_employment_type).map(([key, val]) => `${key}: ${val}`).join(', ')}</span>
                              </div>
                            )}
                            {generated.summary.by_status && Object.keys(generated.summary.by_status).length > 0 && (
                              <div className="filter-badge">
                                <strong>By Status:</strong> <span>{Object.entries(generated.summary.by_status).map(([key, val]) => `${key}: ${val}`).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="modal-right">
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>ID</th>
                              <th>Contact</th>
                              <th>Program</th>
                              <th>Year</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mode === 'students_by_course' ? (
                              (generated.students || []).map(s => {
                                // Build avatar URL - images are stored in public/uploads
                                let avatarUrl = null;
                                if (s.avatar_path) {
                                  // If it starts with http/https, use as-is
                                  if (s.avatar_path.startsWith('http')) {
                                    avatarUrl = s.avatar_path;
                                  } 
                                  // If it starts with uploads/, use directly (already in public folder)
                                  else if (s.avatar_path.startsWith('uploads/')) {
                                    avatarUrl = `/${s.avatar_path}`;
                                  }
                                  // Otherwise assume it's in storage
                                  else {
                                    avatarUrl = `/storage/${s.avatar_path}`;
                                  }
                                } else if (s.profile_picture) {
                                  avatarUrl = s.profile_picture.startsWith('http') ? s.profile_picture : `/${s.profile_picture}`;
                                } else if (s.avatar) {
                                  avatarUrl = s.avatar.startsWith('http') ? s.avatar : `/${s.avatar}`;
                                }
                                
                                const initials = `${(s.first_name || 'S').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
                                
                                return (
                                  <tr key={s.id}>
                                    <td>
                                      <div className="user-info">
                                        <div className="user-avatar">
                                          <div className="avatar-circle">
                                            {avatarUrl ? (
                                              <>
                                                <img 
                                                  src={avatarUrl}
                                                  alt={`${s.first_name} ${s.last_name}`}
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('avatar-error');
                                                  }}
                                                />
                                                <span className="initials fallback">{initials}</span>
                                              </>
                                            ) : (
                                              <span className="initials">{initials}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="user-details">
                                          <div className="user-name">{s.first_name} {s.last_name}</div>
                                          <div className="user-email">{s.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="id-badge">{s.student_id}</span>
                                    </td>
                                    <td>
                                      <div className="contact-info">
                                        <div>{s.phone || s.contact_number || 'N/A'}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="program-info">
                                        <div className="program-name">{s.course}</div>
                                        <div className="department">{s.department || 'N/A'}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="year-badge">{s.year_level}</span>
                                    </td>
                                    <td>
                                      <span className="status-badge status-active">Active</span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              (generated.faculty || []).map(f => {
                                // Build avatar URL - images are stored in public/uploads
                                let avatarUrl = null;
                                if (f.avatar_path) {
                                  // If it starts with http/https, use as-is
                                  if (f.avatar_path.startsWith('http')) {
                                    avatarUrl = f.avatar_path;
                                  } 
                                  // If it starts with uploads/, use directly (already in public folder)
                                  else if (f.avatar_path.startsWith('uploads/')) {
                                    avatarUrl = `/${f.avatar_path}`;
                                  }
                                  // Otherwise assume it's in storage
                                  else {
                                    avatarUrl = `/storage/${f.avatar_path}`;
                                  }
                                } else if (f.profile_picture) {
                                  avatarUrl = f.profile_picture.startsWith('http') ? f.profile_picture : `/${f.profile_picture}`;
                                } else if (f.avatar) {
                                  avatarUrl = f.avatar.startsWith('http') ? f.avatar : `/${f.avatar}`;
                                }
                                
                                const initials = `${(f.first_name || 'F').charAt(0)}${(f.last_name || '').charAt(0)}`.toUpperCase();
                                
                                return (
                                  <tr key={f.id}>
                                    <td>
                                      <div className="user-info">
                                        <div className="user-avatar">
                                          <div className="avatar-circle">
                                            {avatarUrl ? (
                                              <>
                                                <img 
                                                  src={avatarUrl}
                                                  alt={`${f.first_name} ${f.last_name}`}
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('avatar-error');
                                                  }}
                                                />
                                                <span className="initials fallback">{initials}</span>
                                              </>
                                            ) : (
                                              <span className="initials">{initials}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="user-details">
                                          <div className="user-name">{f.first_name} {f.last_name}</div>
                                          <div className="user-email">{f.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="id-badge">{f.faculty_id}</span>
                                    </td>
                                    <td>
                                      <div className="contact-info">
                                        <div>{f.phone || f.contact_number || 'N/A'}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="program-info">
                                        <div className="program-name">{f.position}</div>
                                        <div className="department">{f.department}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="year-badge">Faculty</span>
                                    </td>
                                    <td>
                                      <span className="status-badge status-active">Active</span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="generator-card">
              <div className="card-header-modern">
                <div className="header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <h2>Generate Reports</h2>
                  <p className="card-subtitle">Create custom reports with filters</p>
                </div>
              </div>
              
              <div className="report-generator">
                <div className="generator-section">
                  <label className="form-label-modern">Report Type</label>
                  <select 
                    className="form-select-modern" 
                    value={mode} 
                    onChange={(e)=>{setMode(e.target.value); setGenerated(null);}}
                  >
                    <option value="students_by_course">Students by Course</option>
                    <option value="faculty_by_department">Faculty by Department</option>
                  </select>
                </div>

                <div className="generator-filters-modern">
                  {mode === 'students_by_course' ? (
                    <>
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Course</label>
                        <select className="form-select-modern" value={filters.course} onChange={(e)=>setFilters({...filters, course: e.target.value})}>
                          <option value="">All Courses</option>
                          {filterOptions.courses.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Year Level</label>
                        <select className="form-select-modern" value={filters.year_level} onChange={(e)=>setFilters({...filters, year_level: e.target.value})}>
                          <option value="">All Year Levels</option>
                          {filterOptions.year_levels.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Status</label>
                        <select className="form-select-modern" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                          <option value="">All Statuses</option>
                          {filterOptions.student_statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Department</label>
                        <select className="form-select-modern" value={filters.department} onChange={(e)=>setFilters({...filters, department: e.target.value})}>
                          <option value="">All Departments</option>
                          {filterOptions.departments.map(d => (
                            <option key={d.id || d.code} value={d.name}>{d.code ? `${d.code} - ` : ''}{d.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Position</label>
                        <select className="form-select-modern" value={filters.position} onChange={(e)=>setFilters({...filters, position: e.target.value})}>
                          <option value="">All Positions</option>
                          {filterOptions.positions.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Employment Type</label>
                        <select className="form-select-modern" value={filters.employment_type} onChange={(e)=>setFilters({...filters, employment_type: e.target.value})}>
                          <option value="">All Employment Types</option>
                          {filterOptions.employment_types.map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="filter-group-modern">
                        <label className="form-label-modern">Status</label>
                        <select className="form-select-modern" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                          <option value="">All Statuses</option>
                          {filterOptions.faculty_statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="generator-actions-modern">
                  <button 
                    className="btn-modern btn-primary-modern" 
                    disabled={genLoading} 
                    onClick={handleGenerate}
                  >
                    {genLoading ? (
                      <>
                        <span className="spinner-modern"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="files-section">
              <div className="section-header-modern">
                <div>
                  <h2>Generated Files</h2>
                  <p className="section-subtitle">{filtered.length} file{filtered.length !== 1 ? 's' : ''} available</p>
                </div>
                <div className="search-container-modern">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    className="search-input-modern"
                    placeholder="Search files..."
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="reports-grid-modern">
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <h3>No reports found</h3>
                    <p>Generate your first report to get started</p>
                  </div>
                ) : (
                  filtered.map((r) => (
                    <div key={r.id} className="report-card-modern">
                      <div className="file-icon-modern">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="file-type-badge">{typeOf(r)}</span>
                      </div>
                      <div className="card-content">
                        <h3 className="card-title-modern">{r.report_name}</h3>
                        <div className="card-meta-modern">
                          <span className={`status-badge-modern ${statusOf(r).toLowerCase()}`}>
                            {statusOf(r)}
                          </span>
                          <span className="meta-divider">•</span>
                          <span>{sizeLabel(r)}</span>
                          <span className="meta-divider">•</span>
                          <span>{formatDate(r.generated_at)}</span>
                        </div>
                      </div>
                      <div className="card-actions-modern">
                        <button className="btn-icon-modern" onClick={()=>handleView(r)} title="Download">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </button>
                        <button className="btn-icon-modern btn-danger-modern" onClick={()=>handleDelete(r.id)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
    );
}
