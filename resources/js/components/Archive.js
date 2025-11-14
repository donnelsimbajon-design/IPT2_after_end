import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiRotateCcw } from 'react-icons/fi';
import ArchiveViewModal from './archive/ArchiveViewModal';

export default function Archive() {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState(''); // '', 'Student', 'Faculty', 'Report'
    const [filters, setFilters] = useState({
        status: '',
        document_type: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        archive_id: '',
        document_number: '',
        title: '',
        description: '',
        document_type: 'Report',
        document_date: '',
        archived_date: '',
        archived_by: '',
        department: '',
        reference_number: '',
        status: 'Active',
        tags: '',
        notes: ''
    });
    const [viewing, setViewing] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view'

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
        // Populate form for editing an archive
        setEditingId(archive.id);
        setFormData({
            archive_id: archive.archive_id || '',
            document_number: archive.document_number || '',
            title: archive.title || '',
            description: archive.description || '',
            document_type: archive.document_type || 'Report',
            document_date: archive.document_date || '',
            archived_date: archive.archived_date || '',
            archived_by: archive.archived_by || '',
            department: archive.department || '',
            reference_number: archive.reference_number || '',
            status: archive.status || 'Active',
            tags: archive.tags || '',
            notes: archive.notes || ''
        });
        setShowForm(true);
    };
    const handleModalDelete = async (id) => {
        // delete archive on server and remove from list, then close modal
        try {
            await axios.delete(`/api/archives/${id}`);
            setArchives(prev => prev.filter(a => a.id !== id));
            setMessage('Archive deleted successfully');
        } catch (error) {
            console.error('Error deleting archive:', error);
            setMessage('Error deleting archive');
        }
        closeView();
    };

    const handleModalUnarchive = async (archive) => {
        // reuse existing unarchive flow but close modal after
        await handleUnarchive(archive);
        closeView();
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/archives/${id}`);
            setArchives(prev => prev.filter(a => a.id !== id));
            setMessage('Archive deleted successfully');
        } catch (error) {
            console.error('Error deleting archive:', error);
            setMessage('Error deleting archive');
        }
    };

    const handleUnarchive = async (archive) => {
        try {
            // Determine target and perform unarchive action
            let targetRoute = null;
            if (archive.document_type === 'SchoolYear' && archive.archivable_id) {
                await axios.post(`/api/school-years/${archive.archivable_id}/unarchive`);
                setMessage('School year unarchived');
                targetRoute = '/settings/school-year';
            } else if (archive.document_type === 'Student' && archive.archivable_id) {
                await axios.post(`/api/students/${archive.archivable_id}/unarchive`);
                setMessage('Student unarchived and moved to Students module');
                targetRoute = '/students';
            } else if (archive.document_type === 'Faculty' && archive.archivable_id) {
                await axios.post(`/api/faculties/${archive.archivable_id}/unarchive`);
                setMessage('Faculty unarchived and moved to Faculty module');
                targetRoute = '/faculty';
            } else if (archive.document_type === 'Department' && archive.archivable_id) {
                await axios.post(`/api/departments/${archive.archivable_id}/unarchive`);
                setMessage('Department unarchived and moved to Departments module');
                targetRoute = '/settings/departments';
            } else {
                setMessage('Unarchive is not available for this item.');
            }

            // Delete the archive record on the server so it is removed from Archive module
            try {
                await axios.delete(`/api/archives/${archive.id}`);
            } catch (e) {
                console.error('Failed to delete archive record:', e);
            }

            // Remove the unarchived item from local list so it disappears immediately
            setArchives(prev => prev.filter(a => a.id !== archive.id));

            // If there's a target module, navigate there after a short delay (allow message to show)
            if (targetRoute) {
                setTimeout(() => navigate(targetRoute), 1000);
            }
        } catch (error) {
            console.error('Error unarchiving:', error);
            setMessage('Error unarchiving');
        }
    };

    const handleView = (archive) => {
        // Open modal view for archive details
        setViewing(archive);
        setModalMode('view');
    };

    const closeView = () => {
        setViewing(null);
        setModalMode(null);
    };

    const resetForm = () => {
        setFormData({
            archive_id: '',
            document_number: '',
            title: '',
            description: '',
            document_type: 'Report',
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
                {/* Add Archive button removed per request */}
            </div>
            {modalMode && (
                <ArchiveViewModal
                    initialData={viewing || undefined}
                    onClose={closeView}
                    onDelete={(id) => { handleDelete(id); closeView(); }}
                    onUnarchive={async (archive) => {
                        await handleUnarchive(archive);
                        // After unarchive, close the modal
                        closeView();
                    }}
                    onSave={async (id, updates) => {
                        try {
                            await axios.put(`/api/archives/${id}`, updates);
                            // refresh list
                            fetchArchives();
                            setMessage('Archive updated');
                        } catch (e) {
                            console.error('Failed to save archive:', e);
                            setMessage('Failed to save archive');
                            throw e;
                        }
                    }}
                />
            )}

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
                        <option value="Inactive">Inactive</option>
                    </select>
                    <select name="document_type" value={filters.document_type} onChange={handleFilterChange}>
                        <option value="">All Document Types</option>
                        <option value="Report">Report</option>
                        <option value="Record">Record</option>
                        <option value="Document">Document</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                    </select>
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
                                <option value="Inactive">Inactive</option>
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
                            <th>Document #</th>
                            <th>Reference #</th>
                            <th>Title</th>
                            <th>Document Type</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {archives.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                                    No archives found
                                </td>
                            </tr>
                        ) : (
                            archives.map(archive => (
                                <tr key={archive.id}>
                                    <td>{archive.archive_id}</td>
                                    <td>{archive.document_number || '-'}</td>
                                    <td>{archive.reference_number || '-'}</td>
                                    <td>{archive.title}</td>
                                    <td>{archive.document_type}</td>
                                    <td>{archive.department}</td>
                                    <td>
                                        <span className={`badge badge-${archive.status?.toLowerCase() || 'archived'}`}>
                                            {archive.status || 'Archived'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-icon btn-view" onClick={() => handleView(archive)} title="View">
                                            <FiEye />
                                        </button>
                                        <button className="btn-icon btn-unarchive" onClick={() => handleUnarchive(archive)} title="Unarchive">
                                            <FiRotateCcw />
                                        </button>
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
