import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Philippines',
        enrollment_date: '',
        program: '',
        year_level: '',
        status: 'Active'
    });

    // UI state for search/filters and avatar upload
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ program: '', year_level: '', school_year: '', status: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Options derived from current data
    const programs = useMemo(() => Array.from(new Set(students.map(s => s.program).filter(Boolean))).sort(), [students]);
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
                    program: filters.program || undefined,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let saved;
            if (editingId) {
                const res = await axios.put(`/api/students/${editingId}`, formData);
                saved = res.data.student ?? res.data;
                setMessage('Student updated successfully');
            } else {
                const res = await axios.post('/api/students', formData);
                saved = res.data.student ?? res.data;
                setMessage('Student created successfully');
            }

            // Upload avatar if selected
            if (avatarFile && saved?.id) {
                const fd = new FormData();
                fd.append('avatar', avatarFile);
                await axios.post(`/api/students/${saved.id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            await fetchStudents();
            resetForm();
        } catch (error) {
            console.error('Error saving student:', error);
            setMessage(error.response?.data?.message || 'Error saving student');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setAvatarFile(file);
            try { setAvatarPreview(URL.createObjectURL(file)); } catch { setAvatarPreview(null); }
        }
    };

    const handleEdit = (student) => {
        setFormData(student);
        setEditingId(student.id);
        setShowForm(true);
        setAvatarFile(null);
        if (student.avatar_path) {
            setAvatarPreview(student.avatar_path.startsWith('http') ? student.avatar_path : `/${student.avatar_path}`);
        } else {
            setAvatarPreview(null);
        }
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

    const resetForm = () => {
        setFormData({
            student_id: '',
            first_name: '',
            last_name: '',
            middle_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'Philippines',
            enrollment_date: '',
            program: '',
            year_level: '',
            status: 'Active'
        });
        setEditingId(null);
        setShowForm(false);
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const createArchiveFromStudent = async (student) => {
        const archiveId = `STU-${student.student_id || student.id}-${Date.now()}`;
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const payload = {
            archive_id: archiveId,
            title: `${student.first_name} ${student.last_name}`.trim() || (student.student_id || 'Student'),
            description: `Archived Student: ${student.first_name || ''} ${student.last_name || ''} (${student.student_id || 'N/A'})`,
            document_type: 'Student',
            category: 'Record',
            department: student.program || '',
            reference_number: student.student_id || String(student.id),
            archived_date: ymd,
            status: 'Archived',
            tags: 'student',
        };
        await axios.post('/api/archives', payload);
    };

    const handleArchive = async (student) => {
        if (!confirm('Archive this student?')) return;
        try {
            // Use 'Inactive' to keep within current DB enum while still archiving record separately
            await axios.put(`/api/students/${student.id}`, { status: 'Inactive' });
            try { await createArchiveFromStudent(student); } catch (e) { console.error('Archive create failed', e); }
            setMessage('Student archived successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error archiving student:', error);
            setMessage('Error archiving student');
        }
    };

    if (loading) return <div className="loading">Loading students...</div>;

    return (
        <div className="students-page">
        <div className="module-page">
            <div className="page-header">
                <h1>Students Management</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Student'}
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            {/* Filters and search */}
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
                            <select className="filter" value={filters.program} onChange={(e)=>setFilters({...filters, program: e.target.value})}>
                                <option value="">All Departments</option>
                                {programs.map(p => (<option key={p} value={p}>{p}</option>))}
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
                <div className="form-card">
                    <h2>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                    <form onSubmit={handleSubmit} className="module-form">
                        <div className="form-row">
                            <div className="avatar-input">
                                <div className="avatar-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Student avatar preview" />
                                    ) : (
                                        <div className="placeholder">{(formData.first_name || formData.last_name || 'S').toString().charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                <label className="btn btn-secondary" style={{marginTop: '8px'}}>
                                    Upload Photo
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
                                </label>
                                <small style={{display:'block', color:'var(--text-secondary)'}}>Square image recommended. Displayed as 40x40 circle.</small>
                            </div>
                            <input name="first_name" placeholder="First Name *" value={formData.first_name} onChange={handleChange} required />
                            <input name="last_name" placeholder="Last Name *" value={formData.last_name} onChange={handleChange} required />
                        </div>
                        <div className="form-row">
                            <input name="middle_name" placeholder="Middle Name" value={formData.middle_name} onChange={handleChange} />
                            <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
                            <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input name="date_of_birth" type="date" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} />
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <input name="enrollment_date" type="date" placeholder="Enrollment Date" value={formData.enrollment_date} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input name="program" placeholder="Program (Department)" value={formData.program} onChange={handleChange} />
                            <input name="year_level" placeholder="Year Level" value={formData.year_level} onChange={handleChange} />
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                            <input name="zip_code" placeholder="Zip Code" value={formData.zip_code} onChange={handleChange} />
                            <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Update' : 'Create'} Student
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
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
                                <td>{student.program}</td>
                                <td>{student.year_level}</td>
                                <td>{student.enrollment_date ? new Date(student.enrollment_date).toISOString().slice(0,10) : ''}</td>
                                <td className="actions">
                                    <button className="btn-chip btn-edit" onClick={() => handleEdit(student)}>Edit</button>
                                    <button className="btn-chip btn-delete" onClick={() => handleDelete(student.id)}>Delete</button>
                                    {student.status !== 'Archived' && (
                                        <button className="btn-chip btn-archive" onClick={() => handleArchive(student)}>Archive</button>
                                    )}
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
