import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import FacultyViewModal from './faculty/FacultyViewModal';
import FacultyEditModal from './faculty/FacultyEditModal';

const DEPARTMENTS = [
    { code: 'CSP', name: 'Computer Science Program' },
    { code: 'AP', name: 'Accountancy Program' },
    { code: 'BAP', name: 'Business Administration Program' },
    { code: 'NP', name: 'Nursing Program' },
    { code: 'ICJ', name: 'Criminology Program' },
    { code: 'TEP', name: 'Teacher Education Program' },
    { code: 'ETP', name: 'Engineering Program' },
];

export default function Faculty() {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // modal / view state (match Students pattern)
    const [viewing, setViewing] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
    const [showForm, setShowForm] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const [filters, setFilters] = useState({ department: '', search: '' });

    useEffect(() => {
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchFaculties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchFaculties = async () => {
        try {
            const response = await axios.get('/api/faculties', {
                params: {
                    q: filters.search || undefined,
                    department: filters.department || undefined,
                }
            });
            setFaculties(response.data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setMessage('Error loading faculty');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingData(null);
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const handleEdit = (faculty) => {
        setEditingData(faculty || null);
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const openView = (faculty) => {
        setViewing(faculty);
        setModalMode('view');
    };

    const closeView = () => {
        setViewing(null);
        setModalMode(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await axios.delete(`/api/faculties/${id}`);
            setMessage('Faculty deleted successfully');
            fetchFaculties();
        } catch (error) {
            console.error('Error deleting faculty:', error);
            setMessage('Error deleting faculty');
        }
    };

    const createArchiveFromFaculty = async (faculty) => {
        const archiveId = `FAC-${faculty.id}-${Date.now()}`;
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const payload = {
            archive_id: archiveId,
            title: `${faculty.first_name} ${faculty.last_name}`.trim() || (faculty.faculty_id || 'Faculty'),
            description: `Archived Faculty: ${faculty.first_name || ''} ${faculty.last_name || ''} (${faculty.faculty_id || 'N/A'})`,
            document_type: 'Faculty',
            category: 'Record',
            department: faculty.department || '',
            reference_number: String(faculty.id),
            archived_date: ymd,
            status: 'Archived',
            tags: 'faculty',
        };
        await axios.post('/api/archives', payload);
    };

    const handleArchive = async (faculty) => {
        if (!confirm('Archive this faculty member?')) return;
        try {
            await axios.post(`/api/faculties/${faculty.id}/archive`);
            try { await createArchiveFromFaculty(faculty); } catch (e) { console.error('Archive create failed', e); }
            setMessage('Faculty archived successfully');
            fetchFaculties();
        } catch (error) {
            console.error('Error archiving faculty:', error);
            setMessage('Error archiving faculty');
        }
    };

    const handleUnarchive = async (faculty) => {
        if (!confirm('Unarchive this faculty member?')) return;
        try {
            await axios.post(`/api/faculties/${faculty.id}/unarchive`);
            setMessage('Faculty unarchived successfully');
            fetchFaculties();
        } catch (error) {
            console.error('Error unarchiving faculty:', error);
            setMessage('Error unarchiving faculty');
        }
    };

    const departments = useMemo(() => DEPARTMENTS.map(d => d.code), []);

    if (loading) return <div className="loading">Loading faculty...</div>;

    const filteredFaculties = faculties.filter(f => {
        const matchesDept = filters.department ? String(f.department).toLowerCase() === String(filters.department).toLowerCase() : true;
        const q = (filters.search || '').trim().toLowerCase();
        const matchesSearch = q
            ? (`${f.first_name} ${f.last_name}`.toLowerCase().includes(q)
               || String(f.email || '').toLowerCase().includes(q)
               || String(f.faculty_id || '').toLowerCase().includes(q))
            : true;
        return matchesDept && matchesSearch;
    });

    return (
        <div className="faculty-page">
        <div className="module-page">
            <div className="page-header">
                <h1>Faculty Management</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Faculty</button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="students-panel">
                <div className="panel-header">
                    <h2>Faculty Management</h2>
                    <div className="panel-controls">
                        <input
                            className="search-input"
                            name="search"
                            placeholder="Search"
                            value={filters.search}
                            onChange={(e)=>setFilters({...filters, search: e.target.value})}
                        />
                        <div className="filters">
                            <select
                                className="filter"
                                name="department"
                                value={filters.department}
                                onChange={(e)=>setFilters({...filters, department: e.target.value})}
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map(d => (
                                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <FacultyEditModal
                    initialData={editingData || undefined}
                    onClose={() => { setShowForm(false); setEditingData(null); }}
                    onSaved={(saved) => {
                        setMessage(editingData ? 'Faculty updated successfully' : 'Faculty created successfully');
                        setShowForm(false);
                        setEditingData(null);
                        fetchFaculties();
                    }}
                />
            )}

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Faculty</th>
                            <th>Faculty ID</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Employment Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFaculties.map(faculty => (
                            <tr key={faculty.id}>
                                <td>
                                    <div className="student-cell">
                                        <div className="avatar">
                                            {faculty.avatar_path ? (
                                                <img src={faculty.avatar_path.startsWith('http') ? faculty.avatar_path : `/${faculty.avatar_path}`} alt="Avatar" />
                                            ) : (
                                                <span>{(faculty.first_name || faculty.last_name || 'F').toString().charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="info">
                                            <div className="name">{faculty.first_name} {faculty.last_name}</div>
                                            <div className="sub">{faculty.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{faculty.faculty_id}</td>
                                <td>{faculty.email}</td>
                                <td>{faculty.department}</td>
                                <td>{faculty.position}</td>
                                <td>{faculty.employment_type}</td>
                                <td><span className={`badge badge-${(faculty.status || 'Active').toLowerCase().replace(' ', '-')}`}>{faculty.status || 'Active'}</span></td>
                                <td className="actions">
                                    <button className="btn-chip" onClick={() => openView(faculty)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalMode && (
                <FacultyViewModal
                    initialData={viewing || undefined}
                    onClose={closeView}
                    onEdit={(faculty)=>{ handleEdit(faculty); }}
                    onDelete={(id) => { handleDelete(id); closeView(); }}
                    onArchive={(faculty) => { handleArchive(faculty); closeView(); }}
                    onUnarchive={(faculty) => { handleUnarchive(faculty); closeView(); }}
                />
            )}
        </div>
        </div>
    );
}
