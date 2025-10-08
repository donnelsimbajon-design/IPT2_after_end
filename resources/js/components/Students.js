import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/students');
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
            if (editingId) {
                await axios.put(`/api/students/${editingId}`, formData);
                setMessage('Student updated successfully');
            } else {
                await axios.post('/api/students', formData);
                setMessage('Student created successfully');
            }
            fetchStudents();
            resetForm();
        } catch (error) {
            console.error('Error saving student:', error);
            setMessage(error.response?.data?.message || 'Error saving student');
        }
    };

    const handleEdit = (student) => {
        setFormData(student);
        setEditingId(student.id);
        setShowForm(true);
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
            await axios.put(`/api/students/${student.id}`, { status: 'Archived' });
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

            {showForm && (
                <div className="form-card">
                    <h2>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                    <form onSubmit={handleSubmit} className="module-form">
                        <div className="form-row">
                            <input name="student_id" placeholder="Student ID *" value={formData.student_id} onChange={handleChange} required />
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
                            <input name="program" placeholder="Program" value={formData.program} onChange={handleChange} />
                            <input name="year_level" placeholder="Year Level" value={formData.year_level} onChange={handleChange} />
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Suspended">Suspended</option>
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
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Program</th>
                            <th>Year Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.student_id}</td>
                                <td>{student.first_name} {student.last_name}</td>
                                <td>{student.email}</td>
                                <td>{student.program}</td>
                                <td>{student.year_level}</td>
                                <td><span className={`badge badge-${student.status.toLowerCase()}`}>{student.status}</span></td>
                                <td className="actions">
                                    <button className="btn-icon btn-edit" onClick={() => handleEdit(student)}>Edit</button>
                                    <button className="btn-icon btn-delete" onClick={() => handleDelete(student.id)}>Delete</button>
                                    {student.status !== 'Archived' && (
                                        <button className="btn-icon" onClick={() => handleArchive(student)}>Archive</button>
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
