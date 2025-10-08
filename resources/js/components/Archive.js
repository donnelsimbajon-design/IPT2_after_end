import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Archive() {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeType, setActiveType] = useState(''); // '', 'Student', 'Faculty', 'Report'
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        document_type: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        archive_id: '',
        title: '',
        description: '',
        document_type: 'Report',
        category: '',
        document_date: '',
        archived_date: '',
        archived_by: '',
        department: '',
        reference_number: '',
        status: 'Active',
        tags: '',
        notes: ''
    });

    useEffect(() => {
        fetchArchives();
    }, [filters]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchArchives = async () => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });
            const response = await axios.get(`/api/archives?${params.toString()}`);
            setArchives(response.data);
        } catch (error) {
            console.error('Error fetching archives:', error);
            setMessage('Error loading archives');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/archives/${editingId}`, formData);
                setMessage('Archive updated successfully');
            } else {
                await axios.post('/api/archives', formData);
                setMessage('Archive created successfully');
            }
            fetchArchives();
            resetForm();
        } catch (error) {
            console.error('Error saving archive:', error);
            setMessage(error.response?.data?.message || 'Error saving archive');
        }
    };

    const handleEdit = (archive) => {
        setFormData({
            ...archive,
            document_date: archive.document_date ? archive.document_date.split('T')[0] : '',
            archived_date: archive.archived_date ? archive.archived_date.split('T')[0] : '',
        });
        setEditingId(archive.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this archive?')) return;
        try {
            await axios.delete(`/api/archives/${id}`);
            setMessage('Archive deleted successfully');
            fetchArchives();
        } catch (error) {
            console.error('Error deleting archive:', error);
            setMessage('Error deleting archive');
        }
    };

    const resetForm = () => {
        setFormData({
            archive_id: '',
            title: '',
            description: '',
            document_type: 'Report',
            category: '',
            document_date: '',
            archived_date: '',
            archived_by: '',
            department: '',
            reference_number: '',
            status: 'Active',
            tags: '',
            notes: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSelectType = (type) => {
        setActiveType(type);
        setFilters({ ...filters, document_type: type });
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            category: '',
            document_type: '',
            search: ''
        });
    };

    if (loading) return <div className="loading">Loading archives...</div>;

    return (
        <div className="archives-page">
        <div className="module-page">
            <div className="page-header">
                <h1>Archive Management</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Archive'}
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="archive-tabs">
                <button
                    className={`tab ${activeType === '' ? 'active' : ''}`}
                    onClick={() => handleSelectType('')}
                >All</button>
                <button
                    className={`tab ${activeType === 'Student' ? 'active' : ''}`}
                    onClick={() => handleSelectType('Student')}
                >Student</button>
                <button
                    className={`tab ${activeType === 'Faculty' ? 'active' : ''}`}
                    onClick={() => handleSelectType('Faculty')}
                >Faculty</button>
                <button
                    className={`tab ${activeType === 'Report' ? 'active' : ''}`}
                    onClick={() => handleSelectType('Report')}
                >Report</button>
            </div>

            {/* Filters */}
            <div className="filters-card">
                <h3>Filters</h3>
                <div className="form-row">
                    <input
                        name="search"
                        placeholder="Search archives..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                        <option value="Deleted">Deleted</option>
                    </select>
                    <select name="document_type" value={filters.document_type} onChange={handleFilterChange}>
                        <option value="">All Document Types</option>
                        <option value="Report">Report</option>
                        <option value="Record">Record</option>
                        <option value="Document">Document</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                    </select>
                    <input
                        name="category"
                        placeholder="Category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    />
                    <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
                </div>
            </div>

            {showForm && (
                <div className="form-card">
                    <h2>{editingId ? 'Edit Archive' : 'Add New Archive'}</h2>
                    <form onSubmit={handleSubmit} className="module-form">
                        <div className="form-row">
                            <input name="archive_id" placeholder="Archive ID *" value={formData.archive_id} onChange={handleChange} required />
                            <input name="title" placeholder="Title *" value={formData.title} onChange={handleChange} required />
                            <input name="reference_number" placeholder="Reference Number" value={formData.reference_number} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <select name="document_type" value={formData.document_type} onChange={handleChange}>
                                <option value="Report">Report</option>
                                <option value="Record">Record</option>
                                <option value="Document">Document</option>
                                <option value="Certificate">Certificate</option>
                                <option value="Other">Other</option>
                            </select>
                            <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
                            <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input name="document_date" type="date" placeholder="Document Date" value={formData.document_date} onChange={handleChange} />
                            <input name="archived_date" type="date" placeholder="Archived Date" value={formData.archived_date} onChange={handleChange} />
                            <input name="archived_by" placeholder="Archived By" value={formData.archived_by} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Archived">Archived</option>
                                <option value="Deleted">Deleted</option>
                            </select>
                            <input name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <textarea 
                                name="description" 
                                placeholder="Description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows="3"
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className="form-row">
                            <textarea 
                                name="notes" 
                                placeholder="Notes" 
                                value={formData.notes} 
                                onChange={handleChange}
                                rows="3"
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Update' : 'Create'} Archive
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-card">
                <div className="table-header">
                    <h3>Archives ({archives.length})</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Archive ID</th>
                            <th>Title</th>
                            <th>Document Type</th>
                            <th>Category</th>
                            <th>Department</th>
                            <th>Document Date</th>
                            <th>Reference #</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {archives.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>
                                    No archives found
                                </td>
                            </tr>
                        ) : (
                            archives.map(archive => (
                                <tr key={archive.id}>
                                    <td>{archive.archive_id}</td>
                                    <td>{archive.title}</td>
                                    <td>{archive.document_type}</td>
                                    <td>{archive.category}</td>
                                    <td>{archive.department}</td>
                                    <td>{archive.document_date ? new Date(archive.document_date).toLocaleDateString() : '-'}</td>
                                    <td>{archive.reference_number || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${archive.status.toLowerCase()}`}>
                                            {archive.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-icon btn-edit" onClick={() => handleEdit(archive)} title="Edit">Edit</button>
                                        <button className="btn-icon btn-delete" onClick={() => handleDelete(archive.id)} title="Delete">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}
