import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [filters, setFilters] = useState({ department: '', search: '' });
    const [formData, setFormData] = useState({
        faculty_id: '',
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
        department: '',
        position: '',
        specialization: '',
        hire_date: '',
        employment_type: 'Full-time',
        status: 'Active'
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchFaculties = async () => {
        try {
            const response = await axios.get('/api/faculties');
            setFaculties(response.data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setMessage('Error loading faculty');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let saved;
            if (editingId) {
                const res = await axios.put(`/api/faculties/${editingId}`, formData);
                saved = res.data.faculty ?? res.data;
                setMessage('Faculty updated successfully');
            } else {
                const res = await axios.post('/api/faculties', formData);
                saved = res.data.faculty ?? res.data;
                setMessage('Faculty created successfully');
            }

            if (avatarFile && saved?.id) {
                const fd = new FormData();
                fd.append('avatar', avatarFile);
                await axios.post(`/api/faculties/${saved.id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            await fetchFaculties();
            resetForm();
        } catch (error) {
            console.error('Error saving faculty:', error);
            setMessage(error.response?.data?.message || 'Error saving faculty');
        }
    };

    const handleEdit = (faculty) => {
        setFormData(faculty);
        setEditingId(faculty.id);
        setShowForm(true);
        setAvatarFile(null);
        if (faculty.avatar_path) {
            setAvatarPreview(faculty.avatar_path.startsWith('http') ? faculty.avatar_path : `/${faculty.avatar_path}`);
        } else {
            setAvatarPreview(null);
        }
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

    const resetForm = () => {
        setFormData({
            faculty_id: '',
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
            department: '',
            position: '',
            specialization: '',
            hire_date: '',
            employment_type: 'Full-time',
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

    const handleAvatarChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setAvatarFile(file);
            try { setAvatarPreview(URL.createObjectURL(file)); } catch { setAvatarPreview(null); }
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
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

    if (loading) return <div className="loading">Loading faculty...</div>;

    const filteredFaculties = faculties.filter(f => {
        const matchesDept = filters.department ? String(f.department).toLowerCase() === String(filters.department).toLowerCase() : true;
        const q = filters.search.trim().toLowerCase();
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
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Faculty'}
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="filters-card">
                <h3>Filters</h3>
                <div className="form-row">
                    <select name="department" value={filters.department} onChange={handleFilterChange}>
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map(d => (
                            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                        ))}
                    </select>
                    <input
                        name="search"
                        placeholder="Search by name, email or ID"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {showForm && (
                <div className="form-card">
                    <h2>{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h2>
                    <form onSubmit={handleSubmit} className="module-form">
                        <div className="form-row">
                            <div className="avatar-input">
                                <div className="avatar-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Faculty avatar preview" />
                                    ) : (
                                        <div className="placeholder">{(formData.first_name || formData.last_name || 'F').toString().charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                <label className="btn btn-secondary" style={{marginTop: '8px'}}>
                                    Upload Photo
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
                                </label>
                            </div>
                            <input name="faculty_id" placeholder="Faculty ID *" value={formData.faculty_id} onChange={handleChange} required />
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
                            <input name="hire_date" type="date" placeholder="Hire Date" value={formData.hire_date} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <select name="department" value={formData.department} onChange={handleChange}>
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(d => (
                                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                                ))}
                            </select>
                            <input name="position" placeholder="Position" value={formData.position} onChange={handleChange} />
                            <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Archived">Archived</option>
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
                                {editingId ? 'Update' : 'Create'} Faculty
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
                                <td><span className={`badge badge-${faculty.status.toLowerCase().replace(' ', '-')}`}>{faculty.status}</span></td>
                                <td className="actions">
                                    <button className="btn-icon btn-edit" onClick={() => handleEdit(faculty)}>Edit</button>
                                    <button className="btn-icon btn-delete" onClick={() => handleDelete(faculty.id)}>Delete</button>
                                    {faculty.status !== 'Archived' ? (
                                        <button className="btn-icon" onClick={() => handleArchive(faculty)}>Archive</button>
                                    ) : (
                                        <button className="btn-icon" onClick={() => handleUnarchive(faculty)}>Unarchive</button>
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
