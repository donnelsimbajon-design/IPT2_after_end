import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiArchive, FiLayout } from 'react-icons/fi'; // Import React Icons
import { PiUserSwitchFill } from 'react-icons/pi'; // Import Switch Icon
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
    const location = useLocation();
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // modal / view state (match Students pattern)
    const [viewing, setViewing] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
    const [showForm, setShowForm] = useState(false);
    const [editingData, setEditingData] = useState(null);

    // Design mode state with localStorage persistence
    const [designMode, setDesignMode] = useState(() => {
        return localStorage.getItem('facultyDesignMode') || 'modern';
    });

    // Selection state for bulk actions
    const [selectedFaculties, setSelectedFaculties] = useState([]);
    const [selectMode, setSelectMode] = useState(false);

    // UI state for search/filters
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ department: '', school_year_id: '', status: '' });

    // Options for dropdowns
    const [schoolYears, setSchoolYears] = useState([]);

    useEffect(() => {
        // Load school years for filters
        const loadSchoolYears = async () => {
            try {
                const res = await axios.get('/api/school-years');
                const arr = Array.isArray(res.data) ? res.data : [];
                setSchoolYears(arr);
            } catch (error) {
                console.error('Error loading school years:', error);
                setSchoolYears([]);
            }
        };
        
        loadSchoolYears();
        
        // Initialize department filter from query string if provided
        try {
            const params = new URLSearchParams(location.search || window.location.search || '');
            const dept = params.get('department');
            if (dept) {
                setFilters(f => ({ ...f, department: dept }));
            }
        } catch {}
        fetchFaculties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch when filters or query change
    useEffect(() => {
        fetchFaculties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, filters]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchFaculties = async () => {
        try {
            const response = await axios.get('/api/faculties', {
                params: {
                    q: query || undefined,
                    department: filters.department || undefined,
                    school_year_id: filters.school_year_id || undefined,
                    status: filters.status || undefined,
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
        const seed = filters.department ? { department: filters.department } : null;
        setEditingData(seed);
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    // Selection handlers
    const toggleSelectMode = () => {
        setSelectMode(!selectMode);
        setSelectedFaculties([]);
    };

    const toggleDesignMode = () => {
        const newMode = designMode === 'modern' ? 'classic' : 'modern';
        const message = designMode === 'modern' 
            ? 'Are you sure you want to use the old design structure?' 
            : 'Are you sure you want to use the modern design?';
        
        if (window.confirm(message)) {
            setDesignMode(newMode);
            localStorage.setItem('facultyDesignMode', newMode);
        }
    };

    const toggleFacultySelection = (facultyId) => {
        setSelectedFaculties(prev => {
            if (prev.includes(facultyId)) {
                return prev.filter(id => id !== facultyId);
            } else {
                return [...prev, facultyId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedFaculties.length === faculties.length) {
            setSelectedFaculties([]);
        } else {
            setSelectedFaculties(faculties.map(f => f.id));
        }
    };

    const handleBulkArchive = async () => {
        if (selectedFaculties.length === 0) {
            alert('Please select faculty members to archive');
            return;
        }
        
        if (!confirm(`Archive ${selectedFaculties.length} faculty member(s)? This will move them to archives.`)) return;
        
        try {
            // Archive each selected faculty
            await Promise.all(
                selectedFaculties.map(id => axios.post(`/api/faculties/${id}/archive`))
            );
            setMessage(`${selectedFaculties.length} faculty member(s) archived successfully`);
            setSelectedFaculties([]);
            setSelectMode(false);
            fetchFaculties();
        } catch (error) {
            console.error('Error archiving faculty:', error);
            setMessage('Error archiving some faculty members');
        }
    };

    const handleEdit = async (faculty) => {
        if (faculty && faculty.id) {
            try {
                // Fetch full faculty details with relationships
                const response = await axios.get(`/api/faculties/${faculty.id}`);
                setEditingData(response.data);
            } catch (error) {
                console.error('Error fetching faculty details:', error);
                setEditingData(faculty || null);
            }
        } else {
            setEditingData(null);
        }
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const openView = async (faculty) => {
        if (faculty && faculty.id) {
            try {
                // Fetch full faculty details with relationships
                const response = await axios.get(`/api/faculties/${faculty.id}`);
                setViewing(response.data);
            } catch (error) {
                console.error('Error fetching faculty details:', error);
                setViewing(faculty);
            }
        } else {
            setViewing(faculty);
        }
        // Don't set modalMode - just update the detail panel
        setModalMode(null);
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
            // The backend /api/faculties/{id}/archive endpoint now handles creating the archive record
            await axios.post(`/api/faculties/${faculty.id}/archive`);
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

    const selectedFaculty = viewing || (faculties.length > 0 ? faculties[0] : null);

    // Filter faculties based on search and filters
    const filteredFaculties = faculties.filter(f => {
        const matchesDept = filters.department ? f.department === filters.department : true;
        const matchesSchoolYear = filters.school_year_id ? f.school_year_id == filters.school_year_id : true;
        const matchesStatus = filters.status ? f.status === filters.status : true;
        
        const q = query.toLowerCase().trim();
        const matchesSearch = q
            ? (`${f.first_name || ''} ${f.middle_name || ''} ${f.last_name || ''}`.toLowerCase().includes(q)
               || String(f.faculty_id || '').toLowerCase().includes(q)
               || String(f.email || '').toLowerCase().includes(q))
            : true;
        
        return matchesDept && matchesSchoolYear && matchesStatus && matchesSearch;
    });

    // CLASSIC LAYOUT - Table View (Old Design)
    if (designMode === 'classic') {
        return (
            <div className="faculty-page classic-layout">
                <div className="module-page">
                    <div className="page-header-classic">
                        <h1>Faculty Management</h1>
                        <div className="header-actions">
                            <button 
                                className="btn-switch-icon" 
                                onClick={toggleDesignMode} 
                                title="Switch to Modern Design"
                            >
                                <PiUserSwitchFill />
                            </button>
                            <button className="btn btn-primary" onClick={openAdd}>+ Add Faculty</button>
                        </div>
                    </div>

                    {message && <div className="alert alert-info">{message}</div>}

                    <div className="students-filters-card">
                        <div className="filters-row">
                            <input
                                className="search-input"
                                name="search"
                                placeholder="Search faculty..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <select
                                className="filter"
                                name="department"
                                value={filters.department}
                                onChange={(e) => setFilters({...filters, department: e.target.value})}
                            >
                                <option value="">Departments</option>
                                {DEPARTMENTS.map(d => (
                                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                                ))}
                            </select>
                            <select
                                className="filter"
                                name="school_year_id"
                                value={filters.school_year_id}
                                onChange={(e) => setFilters({...filters, school_year_id: e.target.value})}
                            >
                                <option value="">School Years</option>
                                {schoolYears.map(sy => (
                                    <option key={sy.id} value={sy.id}>{sy.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Faculty</th>
                                    <th>Faculty ID</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Position</th>
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
                                        <td><span className={`badge badge-${(faculty.status || 'Active').toLowerCase().replace(' ', '-')}`}>{faculty.status || 'Active'}</span></td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => handleEdit(faculty)} title="Edit">
                                                <FiEdit2 />
                                            </button>
                                            <button className="btn-icon btn-archive" onClick={() => handleArchive(faculty)} title="Archive">
                                                <FiArchive />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

    // MODERN LAYOUT - Split View (New Design)
    return (
        <div className={`faculty-page modern-layout`}>
            {message && <div className="alert alert-info">{message}</div>}
            
            {/* Main Content */}
            <div className="students-split-view">
                {/* Left Sidebar - Faculty List */}
                <div className="students-sidebar">
                    <div className="sidebar-header">
                        <h2>Faculty</h2>
                        <div className="header-actions">
                            <button 
                                className={`btn-icon-small ${designMode === 'modern' ? 'btn-active' : ''}`} 
                                onClick={toggleDesignMode} 
                                title={`Switch to ${designMode === 'modern' ? 'Classic' : 'Modern'} Design`}
                            >
                                <PiUserSwitchFill />
                            </button>
                            {selectMode ? (
                                <>
                                    <button className="btn-icon-small btn-success" onClick={handleBulkArchive} title="Archive Selected">
                                        <FiArchive />
                                    </button>
                                    <button className="btn-icon-small btn-cancel" onClick={toggleSelectMode} title="Cancel Selection">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-icon-small" onClick={toggleSelectMode} title="Select Multiple">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                        </svg>
                                    </button>
                                    <button className="btn-icon-small" onClick={openAdd} title="Add Faculty">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {selectMode && (
                        <div className="selection-bar">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={selectedFaculties.length === faculties.length && faculties.length > 0}
                                    onChange={toggleSelectAll}
                                />
                                <span>Select All ({selectedFaculties.length}/{faculties.length})</span>
                            </label>
                        </div>
                    )}

                    <div className="sidebar-search">
                        <svg className="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search for faculty or ID"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="sidebar-filters">
                        <div className="filter-group">
                            <label htmlFor="dept-filter">Department</label>
                            <select 
                                id="dept-filter"
                                className="filter-select" 
                                value={filters.department} 
                                onChange={(e) => setFilters({...filters, department: e.target.value})}
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map(d => (<option key={d.code} value={d.code}>{d.code} - {d.name}</option>))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="sy-filter">School Year</label>
                            <select 
                                id="sy-filter"
                                className="filter-select" 
                                value={filters.school_year_id} 
                                onChange={(e) => setFilters({...filters, school_year_id: e.target.value})}
                            >
                                <option value="">All School Years</option>
                                {schoolYears.map(sy => (<option key={sy.id} value={sy.id}>{sy.label}</option>))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="status-filter">Status</label>
                            <select 
                                id="status-filter"
                                className="filter-select" 
                                value={filters.status} 
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>
                    </div>

                    <div className="students-list">
                        {faculties.map(faculty => (
                            <div
                                key={faculty.id}
                                className={`student-item ${selectedFaculty?.id === faculty.id ? 'active' : ''} ${selectedFaculties.includes(faculty.id) ? 'selected' : ''}`}
                                onClick={(e) => {
                                    if (selectMode) {
                                        e.stopPropagation();
                                        toggleFacultySelection(faculty.id);
                                    } else {
                                        openView(faculty);
                                    }
                                }}
                            >
                                {selectMode && (
                                    <div className="student-checkbox" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedFaculties.includes(faculty.id)}
                                            onChange={() => toggleFacultySelection(faculty.id)}
                                        />
                                    </div>
                                )}
                                <div className="student-avatar">
                                    {faculty.avatar_path ? (
                                        <img src={faculty.avatar_path.startsWith('http') ? faculty.avatar_path : `/${faculty.avatar_path}`} alt={`${faculty.first_name} ${faculty.last_name}`} />
                                    ) : (
                                        <span className="avatar-placeholder">
                                            {(faculty.first_name || faculty.last_name || 'F').toString().charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="student-info">
                                    <div className="student-name">{faculty.first_name} {faculty.last_name}</div>
                                    <div className="student-meta">{faculty.department || 'N/A'}</div>
                                </div>
                                <div className="student-badges">
                                    <span className="student-id-badge">{faculty.faculty_id || 'N/A'}</span>
                                    <span className="year-badge">{faculty.position || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Faculty Details */}
                {selectedFaculty ? (
                    <div className="student-detail-panel">
                        <div className="detail-header">
                            <div className="detail-header-content">
                                <div className="student-profile-header">
                                    <div className="profile-avatar-large">
                                        {selectedFaculty.avatar_path ? (
                                            <img src={selectedFaculty.avatar_path.startsWith('http') ? selectedFaculty.avatar_path : `/${selectedFaculty.avatar_path}`} alt={`${selectedFaculty.first_name} ${selectedFaculty.last_name}`} />
                                        ) : (
                                            <span className="avatar-placeholder-large">
                                                {(selectedFaculty.first_name || selectedFaculty.last_name || 'F').toString().charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{selectedFaculty.first_name} {selectedFaculty.last_name}</h2>
                                        <p className="profile-meta">{selectedFaculty.position || 'N/A'} | Faculty ID: {selectedFaculty.faculty_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="profile-actions">
                                    <button className="btn-icon btn-edit" onClick={() => handleEdit(selectedFaculty)} title="Edit">
                                        <FiEdit2 />
                                    </button>
                                    <button className="btn-icon btn-archive" onClick={() => handleArchive(selectedFaculty)} title="Archive">
                                        <FiArchive />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="detail-content">
                            <div className="detail-section">
                                <h3>Basic Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Gender</label>
                                        <span>{selectedFaculty.gender || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <span>{selectedFaculty.date_of_birth || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Nationality</label>
                                        <span>{selectedFaculty.nationality || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Blood Group</label>
                                        <span>{selectedFaculty.blood_type || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Address</label>
                                        <span>{selectedFaculty.address || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact</label>
                                        <span>{selectedFaculty.phone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <span>{selectedFaculty.email || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Emergency Contact</label>
                                        <span>{selectedFaculty.emergency_contact || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Employment Information</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Department</label>
                                        <span>{selectedFaculty.department || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Position</label>
                                        <span>{selectedFaculty.position || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Employment Type</label>
                                        <span>{selectedFaculty.employment_type || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Hire Date</label>
                                        <span>{selectedFaculty.hire_date ? new Date(selectedFaculty.hire_date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Specialization</label>
                                        <span>{selectedFaculty.specialization || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Qualification</label>
                                        <span>{selectedFaculty.qualification || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status</label>
                                        <span className={`badge badge-${(selectedFaculty.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                                            {selectedFaculty.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Teaching Overview</h3>
                                <div className="overview-stats">
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F5E6EA', color: '#8B1538'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Total Students</div>
                                            <div className="stat-value">145</div>
                                            <div className="stat-change positive">+12 this semester</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#FBF6E8', color: '#D4AF37'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Subjects Teaching</div>
                                            <div className="stat-value">5</div>
                                            <div className="stat-change">Across 8 sections</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F0E5E9', color: '#A71D45'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Average Rating</div>
                                            <div className="stat-value">4.8</div>
                                            <div className="stat-change positive">Outstanding Performance</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F9F3E3', color: '#C9A961'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Teaching Hours</div>
                                            <div className="stat-value">24</div>
                                            <div className="stat-change">Hours per week</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="overview-progress-section">
                                    <h4>Class Performance</h4>
                                    <div className="subject-progress-list">
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Advanced Mathematics - Section A</span>
                                                <span className="subject-grade">35 students</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '89%', backgroundColor: '#8B1538'}}></div>
                                            </div>
                                            <span className="progress-percentage">89% avg</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Calculus - Section B</span>
                                                <span className="subject-grade">32 students</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '85%', backgroundColor: '#D4AF37'}}></div>
                                            </div>
                                            <span className="progress-percentage">85% avg</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Statistics - Section A</span>
                                                <span className="subject-grade">28 students</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '92%', backgroundColor: '#A71D45'}}></div>
                                            </div>
                                            <span className="progress-percentage">92% avg</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Algebra - Section C</span>
                                                <span className="subject-grade">30 students</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '87%', backgroundColor: '#C9A961'}}></div>
                                            </div>
                                            <span className="progress-percentage">87% avg</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Research Methods - Section A</span>
                                                <span className="subject-grade">20 students</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '94%', backgroundColor: '#8B1538'}}></div>
                                            </div>
                                            <span className="progress-percentage">94% avg</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overview-activities">
                                    <h4>Recent Activities</h4>
                                    <div className="activity-timeline">
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#8B1538'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    <polyline points="14 2 14 8 20 8"/>
                                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                                    <polyline points="10 9 9 9 8 9"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Graded Final Exams - Section A</div>
                                                <div className="activity-time">1 day ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#D4AF37'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Faculty Meeting - Curriculum Review</div>
                                                <div className="activity-time">3 days ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#A71D45'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Received Excellence in Teaching Award</div>
                                                <div className="activity-time">1 week ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#C9A961'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Published Research Paper</div>
                                                <div className="activity-time">2 weeks ago</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="student-detail-panel empty-state">
                        <p>Select a faculty member to view details</p>
                    </div>
                )}
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
    );
}
