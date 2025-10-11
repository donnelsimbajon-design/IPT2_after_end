import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import StudentViewModal from './students/StudentViewModal';
import StudentEditModal from './students/StudentEditModal';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
    const [showForm, setShowForm] = useState(false);
    const [editingData, setEditingData] = useState(null);
    // no local form state here; editing/creating handled in StudentViewModal/StudentForm

    // UI state for search/filters
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ department: '', year_level: '', school_year: '', status: '' });

    // Options derived from current data
    const departments = useMemo(() => Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort(), [students]);
    const yearLevels = useMemo(() => Array.from(new Set(students.map(s => s.year_level).filter(Boolean))).sort(), [students]);
    const schoolYears = useMemo(() => Array.from(new Set(students.map(s => s.enrollment_date ? new Date(s.enrollment_date).getFullYear() : null).filter(Boolean))).sort(), [students]);

    useEffect(() => {
        fetchStudents();
    }, []);

    // Refetch when filters or search query changes
    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, filters]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/students', {
                params: {
                    q: query || undefined,
                    department: filters.department || undefined,
                    year_level: filters.year_level || undefined,
                    school_year: filters.school_year || undefined,
                    status: filters.status || undefined,
                }
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage('Error loading students');
        } finally {
            setLoading(false);
        }
    };

    // editing/creating handled in modal

    const handleEdit = (student) => {
        setEditingData(student || null);
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const openView = (student) => {
        setViewing(student);
        setModalMode('view');
    };
    const closeView = () => {
        setViewing(null);
        setModalMode(null);
    };
    const openAdd = () => {
        setEditingData(null);
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            await axios.delete(`/api/students/${id}`);
            setMessage('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            setMessage('Error deleting student');
        }
    };

    // no local form handlers

    const createArchiveFromStudent = async (student) => {
        const archiveId = `STU-${student.id}-${Date.now()}`;
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const payload = {
            archive_id: archiveId,
            title: `${student.first_name} ${student.last_name}`.trim() || (student.student_id || 'Student'),
            description: `Archived Student: ${student.first_name || ''} ${student.last_name || ''} (${student.student_id || 'N/A'})`,
            document_type: 'Student',
            category: 'Record',
            department: student.department || student.program || '',
            reference_number: String(student.id),
            archived_date: ymd,
            status: 'Archived',
            tags: 'student',
        };
        await axios.post('/api/archives', payload);
    };

    const handleArchive = async (student) => {
        if (!confirm('Archive this student?')) return;
        try {
            await axios.post(`/api/students/${student.id}/archive`);
            try { await createArchiveFromStudent(student); } catch (e) { console.error('Archive create failed', e); }
            setMessage('Student archived successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error archiving student:', error);
            setMessage('Error archiving student');
        }
    };

    const handleUnarchive = async (student) => {
        if (!confirm('Unarchive this student?')) return;
        try {
            await axios.post(`/api/students/${student.id}/unarchive`);
            setMessage('Student unarchived successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error unarchiving student:', error);
            setMessage('Error unarchiving student');
        }
    };

    if (loading) return <div className="loading">Loading students...</div>;

    return (
        <div className="students-page">
        <div className="module-page">
            <div className="page-header">
                <h1>Students Management</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="students-panel">
                <div className="panel-header">
                    <h2>Student Management</h2>
                    <div className="panel-controls">
                        <input
                            className="search-input"
                            placeholder="Search"
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                        />
                        <div className="filters">
                            <select className="filter" value={filters.department} onChange={(e)=>setFilters({...filters, department: e.target.value})}>
                                <option value="">All Departments</option>
                                {departments.map(p => (<option key={p} value={p}>{p}</option>))}
                            </select>
                            <select className="filter" value={filters.year_level} onChange={(e)=>setFilters({...filters, year_level: e.target.value})}>
                                <option value="">All Year Levels</option>
                                {yearLevels.map(y => (<option key={y} value={y}>{y}</option>))}
                            </select>
                            <select className="filter" value={filters.school_year} onChange={(e)=>setFilters({...filters, school_year: e.target.value})}>
                                <option value="">All School Years</option>
                                {schoolYears.map(y => (<option key={y} value={y}>{y}</option>))}
                            </select>
                            <select className="filter" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                                <option value="">Any Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Archived">Archived</option>
                            </select>
                            <label className="active-only">
                                <input type="checkbox" checked={filters.status === 'Active'} onChange={(e)=> setFilters({...filters, status: e.target.checked ? 'Active' : ''})} />
                                <span>Active only</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <StudentEditModal
                    initialData={editingData || undefined}
                    onClose={() => { setShowForm(false); setEditingData(null); }}
                    onSaved={(saved) => {
                        setMessage(editingData ? 'Student updated successfully' : 'Student created successfully');
                        setShowForm(false);
                        setEditingData(null);
                        fetchStudents();
                    }}
                />
            )}

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Student ID</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Year Level</th>
                            <th>Enrollment Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <div className="student-cell">
                                        <div className="avatar">
                                            {student.avatar_path ? (
                                                <img src={student.avatar_path.startsWith('http') ? student.avatar_path : `/${student.avatar_path}`} alt="Avatar" />
                                            ) : (
                                                <span>{(student.first_name || student.last_name || 'S').toString().charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="info">
                                            <div className="name">{student.first_name} {student.last_name}</div>
                                            <div className="sub">{student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{student.student_id}</td>
                                <td>{student.email}</td>
                                <td>{student.department || student.program}</td>
                                <td>{student.year_level}</td>
                                <td>{student.enrollment_date ? new Date(student.enrollment_date).toISOString().slice(0,10) : ''}</td>
                                <td><span className={`badge badge-${(student.status || 'Active').toLowerCase().replace(' ', '-')}`}>{student.status || 'Active'}</span></td>
                                <td className="actions">
                                    <button className="btn-chip" onClick={() => openView(student)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalMode && (
                <StudentViewModal
                    initialData={viewing || undefined}
                    onClose={closeView}
                    onEdit={(student)=>{ handleEdit(student); }}
                    onDelete={(id) => { handleDelete(id); closeView(); }}
                    onArchive={(student) => { handleArchive(student); closeView(); }}
                    onUnarchive={(student) => { handleUnarchive(student); closeView(); }}
                />
            )}
        </div>
        </div>
    );
}
