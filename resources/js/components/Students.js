import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiArchive, FiLayout } from 'react-icons/fi'; // Import React Icons
import { PiUserSwitchFill } from 'react-icons/pi'; // Import Switch Icon
import StudentViewModal from './students/StudentViewModal';
import StudentEditModal from './students/StudentEditModal';

// Performance Chart Component
const PerformanceChart = () => {
    const [activeTab, setActiveTab] = useState('progress');
    const [activeSubject, setActiveSubject] = useState('all');

    const chartData = {
        progress: {
            all: [55, 79, 65, 82, 70, 75],
            maths: [52, 79, 62, 78, 68, 73],
            science: [58, 75, 68, 85, 72, 77],
            english: [54, 76, 64, 80, 69, 74],
            history: [51, 74, 61, 79, 66, 71]
        },
        attendance: {
            all: [88, 92, 85, 95, 90, 93],
            maths: [85, 90, 82, 92, 88, 91],
            science: [90, 94, 88, 97, 92, 95],
            english: [87, 91, 84, 94, 89, 92],
            history: [86, 89, 83, 93, 87, 90]
        }
    };

    const subjects = [
        { id: 'all', label: 'All', color: '#8B1538' },
        { id: 'maths', label: 'Maths', color: '#3B82F6' },
        { id: 'science', label: 'Science', color: '#EF4444' },
        { id: 'english', label: 'English', color: '#F59E0B' },
        { id: 'history', label: 'History', color: '#10B981' }
    ];

    const tabs = [
        { id: 'progress', label: 'Progress' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'fees', label: 'Fees History' },
        { id: 'bus', label: 'School Bus' }
    ];

    const currentData = chartData[activeTab]?.[activeSubject] || chartData.progress.all;
    const maxValue = 100;

    return (
        <div className="performance-chart-container">
            <div className="chart-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`chart-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="chart-content">
                <div className="chart-filters">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            className={`filter-button ${activeSubject === subject.id ? 'active' : ''}`}
                            onClick={() => setActiveSubject(subject.id)}
                            style={{
                                color: activeSubject === subject.id ? subject.color : '#6B7280',
                                borderColor: activeSubject === subject.id ? subject.color : 'transparent'
                            }}
                        >
                            <span className="filter-dot" style={{ 
                                backgroundColor: subject.color,
                                opacity: activeSubject === subject.id ? 1 : 0.5
                            }}></span>
                            {subject.label}
                        </button>
                    ))}
                </div>

                <div className="chart-wrapper">
                    <div className="chart-y-axis">
                        {[100, 75, 50, 25, 0].map(val => (
                            <div key={val} className="y-axis-label">{val}%</div>
                        ))}
                    </div>

                    <div className="chart-area">
                        <svg className="chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((val, i) => (
                                <line
                                    key={`grid-${val}`}
                                    x1="0"
                                    y1={200 - (val * 2)}
                                    x2="600"
                                    y2={200 - (val * 2)}
                                    stroke="#F3F4F6"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Performance line */}
                            <polyline
                                points={currentData.map((val, i) => {
                                    const x = (i / (currentData.length - 1)) * 600;
                                    const y = 200 - ((val / maxValue) * 200);
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke={subjects.find(s => s.id === activeSubject)?.color || '#8B1538'}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {currentData.map((val, i) => {
                                const x = (i / (currentData.length - 1)) * 600;
                                const y = 200 - ((val / maxValue) * 200);
                                const isHighlight = i === 1; // Highlight Test 2
                                return (
                                    <g key={`point-${i}`}>
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={isHighlight ? "6" : "4"}
                                            fill="white"
                                            stroke={subjects.find(s => s.id === activeSubject)?.color || '#8B1538'}
                                            strokeWidth="2"
                                        />
                                        {isHighlight && (
                                            <>
                                                <line x1={x} y1={y} x2={x} y2="200" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
                                                <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fill="#1F2937" fontWeight="600">
                                                    {val}%
                                                </text>
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                <div className="chart-x-axis">
                    {['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5', 'Test 6'].map((label, i) => (
                        <div key={i} className="x-axis-label">{label}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Students() {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
    const [showForm, setShowForm] = useState(false);
    const [editingData, setEditingData] = useState(null);
    // no local form state here; editing/creating handled in StudentViewModal/StudentForm

    // Design mode state with localStorage persistence
    const [designMode, setDesignMode] = useState(() => {
        return localStorage.getItem('studentDesignMode') || 'modern';
    });

    // Selection state for bulk actions
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectMode, setSelectMode] = useState(false);

    // UI state for search/filters
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ department: '', year_level: '', school_year_id: '', status: '' });

    // Options for dropdowns
    const [schoolYears, setSchoolYears] = useState([]);
    
    // Options derived from current data
    const departments = useMemo(() => Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort(), [students]);
    const yearLevels = useMemo(() => Array.from(new Set(students.map(s => s.year_level).filter(Boolean))).sort(), [students]);

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
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/students', {
                params: {
                    q: query || undefined,
                    department: filters.department || undefined,
                    year_level: filters.year_level || undefined,
                    school_year_id: filters.school_year_id || undefined,
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

    // Re-fetch when filters or query change
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

    // editing/creating handled in modal

    const handleEdit = async (student) => {
        if (student && student.id) {
            try {
                // Fetch full student details with relationships
                const response = await axios.get(`/api/students/${student.id}`);
                setEditingData(response.data);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setEditingData(student || null);
            }
        } else {
            setEditingData(null);
        }
        setShowForm(true);
        setViewing(null);
        setModalMode(null);
    };

    const openView = async (student) => {
        if (student && student.id) {
            try {
                // Fetch full student details with relationships
                const response = await axios.get(`/api/students/${student.id}`);
                setViewing(response.data);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setViewing(student);
            }
        } else {
            setViewing(student);
        }
        // Don't set modalMode - just update the detail panel
        setModalMode(null);
    };
    const closeView = () => {
        setViewing(null);
        setModalMode(null);
    };
    const openAdd = () => {
        const seed = filters.department ? { department: filters.department } : null;
        setEditingData(seed);
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
        if (!confirm(`Archive ${student.first_name} ${student.last_name}? This will move the student to archives.`)) return;
        try {
            // The backend /api/students/{id}/archive endpoint now handles creating the archive record
            await axios.post(`/api/students/${student.id}/archive`);
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

    // Selection handlers
    const toggleSelectMode = () => {
        setSelectMode(!selectMode);
        setSelectedStudents([]);
    };

    const toggleDesignMode = () => {
        const newMode = designMode === 'modern' ? 'classic' : 'modern';
        const message = designMode === 'modern' 
            ? 'Are you sure you want to use the old design structure?' 
            : 'Are you sure you want to use the modern design?';
        
        if (window.confirm(message)) {
            setDesignMode(newMode);
            localStorage.setItem('studentDesignMode', newMode);
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const handleBulkArchive = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select students to archive');
            return;
        }
        
        if (!confirm(`Archive ${selectedStudents.length} student(s)? This will move them to archives.`)) return;
        
        try {
            // Archive each selected student
            await Promise.all(
                selectedStudents.map(id => axios.post(`/api/students/${id}/archive`))
            );
            setMessage(`${selectedStudents.length} student(s) archived successfully`);
            setSelectedStudents([]);
            setSelectMode(false);
            fetchStudents();
        } catch (error) {
            console.error('Error archiving students:', error);
            setMessage('Error archiving some students');
        }
    };

    if (loading) return <div className="loading">Loading students...</div>;

    const selectedStudent = viewing || (students.length > 0 ? students[0] : null);

    // Filter students based on search and filters
    const filteredStudents = students.filter(s => {
        const matchesDept = filters.department ? s.department === filters.department : true;
        const matchesYear = filters.year_level ? s.year_level === filters.year_level : true;
        const matchesSchoolYear = filters.school_year_id ? s.school_year_id == filters.school_year_id : true;
        const matchesStatus = filters.status ? s.status === filters.status : true;
        
        const q = query.toLowerCase().trim();
        const matchesSearch = q
            ? (`${s.first_name || ''} ${s.middle_name || ''} ${s.last_name || ''}`.toLowerCase().includes(q)
               || String(s.student_id || '').toLowerCase().includes(q)
               || String(s.email || '').toLowerCase().includes(q))
            : true;
        
        return matchesDept && matchesYear && matchesSchoolYear && matchesStatus && matchesSearch;
    });

    // CLASSIC LAYOUT - Table View (Old Design)
    if (designMode === 'classic') {
        return (
            <div className="students-page classic-layout">
                <div className="module-page">
                    <div className="page-header-classic">
                        <h1>Student Management</h1>
                        <div className="header-actions">
                            <button 
                                className="btn-switch-icon" 
                                onClick={toggleDesignMode} 
                                title="Switch to Modern Design"
                            >
                                <PiUserSwitchFill />
                            </button>
                            <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
                        </div>
                    </div>

                    {message && <div className="alert alert-info">{message}</div>}

                    <div className="students-filters-card">
                        <div className="filters-row">
                            <input
                                className="search-input"
                                name="search"
                                placeholder="Search students..."
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
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <select
                                className="filter"
                                name="year_level"
                                value={filters.year_level}
                                onChange={(e) => setFilters({...filters, year_level: e.target.value})}
                            >
                                <option value="">Year Levels</option>
                                        {yearLevels.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select
                                className="filter"
                                name="school_year_id"
                                value={filters.school_year_id}
                                onChange={(e) => setFilters({...filters, school_year_id: e.target.value})}
                            >
                                <option value="">Academic Years</option>
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
                                    <th>Student</th>
                                    <th>Student ID</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Year Level</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
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
                                        <td>{student.department}</td>
                                        <td>{student.year_level}</td>
                                        <td><span className={`badge badge-${(student.status || 'Active').toLowerCase().replace(' ', '-')}`}>{student.status || 'Active'}</span></td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => handleEdit(student)} title="Edit">
                                                <FiEdit2 />
                                            </button>
                                            <button className="btn-icon btn-archive" onClick={() => handleArchive(student)} title="Archive">
                                                <FiArchive />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

    // MODERN LAYOUT - Split View (New Design)
    return (
        <div className={`students-page modern-layout`}>
            {message && <div className="alert alert-info">{message}</div>}
            
            {/* Main Content */}
            <div className="students-split-view">
                {/* Left Sidebar - Students List */}
                <div className="students-sidebar">
                    <div className="sidebar-header">
                        <h2>Students</h2>
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
                                    <button className="btn-icon-small" onClick={openAdd} title="Add Student">
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
                                    checked={selectedStudents.length === students.length && students.length > 0}
                                    onChange={toggleSelectAll}
                                />
                                <span>Select All ({selectedStudents.length}/{students.length})</span>
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
                            placeholder="Search for students or ID"
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
                                    {departments.map(p => (<option key={p} value={p}>{p}</option>))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="year-filter">Year Level</label>
                                <select 
                                    id="year-filter"
                                    className="filter-select" 
                                    value={filters.year_level} 
                                    onChange={(e) => setFilters({...filters, year_level: e.target.value})}
                                >
                                    <option value="">All Year Levels</option>
                                    {yearLevels.map(y => (<option key={y} value={y}>{y}</option>))}
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
                                    <option value="Graduated">Graduated</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>                    <div className="students-list">
                        {students.map(student => (
                            <div
                                key={student.id}
                                className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''} ${selectedStudents.includes(student.id) ? 'selected' : ''}`}
                                onClick={(e) => {
                                    if (selectMode) {
                                        e.stopPropagation();
                                        toggleStudentSelection(student.id);
                                    } else {
                                        openView(student);
                                    }
                                }}
                            >
                                {selectMode && (
                                    <div className="student-checkbox" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudentSelection(student.id)}
                                        />
                                    </div>
                                )}
                                <div className="student-avatar">
                                    {student.avatar_path ? (
                                        <img src={student.avatar_path.startsWith('http') ? student.avatar_path : `/${student.avatar_path}`} alt={`${student.first_name} ${student.last_name}`} />
                                    ) : (
                                        <span className="avatar-placeholder">
                                            {(student.first_name || student.last_name || 'S').toString().charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="student-info">
                                    <div className="student-name">{student.first_name} {student.last_name}</div>
                                    <div className="student-meta">{student.department || 'N/A'}</div>
                                </div>
                                <div className="student-badges">
                                    <span className="student-id-badge">{student.student_id || 'N/A'}</span>
                                    <span className="year-badge">{student.year_level || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Student Details */}
                {selectedStudent ? (
                    <div className="student-detail-panel">
                        <div className="detail-header">
                            <div className="detail-header-content">
                                <div className="student-profile-header">
                                    <div className="profile-avatar-large">
                                        {selectedStudent.avatar_path ? (
                                            <img src={selectedStudent.avatar_path.startsWith('http') ? selectedStudent.avatar_path : `/${selectedStudent.avatar_path}`} alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`} />
                                        ) : (
                                            <span className="avatar-placeholder-large">
                                                {(selectedStudent.first_name || selectedStudent.last_name || 'S').toString().charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                        <p className="profile-meta">{selectedStudent.year_level || 'N/A'} | Student ID: {selectedStudent.student_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="profile-actions">
                                    <button className="btn-icon btn-edit" onClick={() => handleEdit(selectedStudent)} title="Edit">
                                        <FiEdit2 />
                                    </button>
                                    <button className="btn-icon btn-archive" onClick={() => handleArchive(selectedStudent)} title="Archive">
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
                                        <span>{selectedStudent.gender || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <span>{selectedStudent.date_of_birth || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Religion</label>
                                        <span>{selectedStudent.religion || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Blood Group</label>
                                        <span>{selectedStudent.blood_type || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Address</label>
                                        <span>{selectedStudent.address || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Father</label>
                                        <span>{selectedStudent.father_name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Mother</label>
                                        <span>{selectedStudent.mother_name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact</label>
                                        <span>{selectedStudent.phone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <span>{selectedStudent.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Academic Information</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Department</label>
                                        <span>{selectedStudent.department || selectedStudent.program || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Year Level</label>
                                        <span>{selectedStudent.year_level || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Enrollment Date</label>
                                        <span>{selectedStudent.enrollment_date ? new Date(selectedStudent.enrollment_date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status</label>
                                        <span className={`badge badge-${(selectedStudent.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                                            {selectedStudent.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Academic Overview</h3>
                                
                                {/* Performance Chart */}
                                <PerformanceChart />

                                <div className="overview-stats">
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F5E6EA', color: '#8B1538'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Subjects Enrolled</div>
                                            <div className="stat-value">8</div>
                                            <div className="stat-change positive">+2 from last semester</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#FBF6E8', color: '#D4AF37'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Attendance Rate</div>
                                            <div className="stat-value">95%</div>
                                            <div className="stat-change positive">+3% from last month</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F0E5E9', color: '#A71D45'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Current GPA</div>
                                            <div className="stat-value">3.8</div>
                                            <div className="stat-change positive">Excellent Performance</div>
                                        </div>
                                    </div>
                                    <div className="overview-stat-card">
                                        <div className="stat-icon" style={{backgroundColor: '#F9F3E3', color: '#C9A961'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">Days Present</div>
                                            <div className="stat-value">142</div>
                                            <div className="stat-change">Out of 150 days</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="overview-progress-section">
                                    <h4>Subject Performance</h4>
                                    <div className="subject-progress-list">
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Mathematics</span>
                                                <span className="subject-grade">A</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '92%', backgroundColor: '#8B1538'}}></div>
                                            </div>
                                            <span className="progress-percentage">92%</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Science</span>
                                                <span className="subject-grade">A</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '88%', backgroundColor: '#D4AF37'}}></div>
                                            </div>
                                            <span className="progress-percentage">88%</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">English</span>
                                                <span className="subject-grade">B+</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '85%', backgroundColor: '#A71D45'}}></div>
                                            </div>
                                            <span className="progress-percentage">85%</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">History</span>
                                                <span className="subject-grade">B+</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '82%', backgroundColor: '#C9A961'}}></div>
                                            </div>
                                            <span className="progress-percentage">82%</span>
                                        </div>
                                        <div className="subject-progress-item">
                                            <div className="subject-info">
                                                <span className="subject-name">Computer Science</span>
                                                <span className="subject-grade">A</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: '90%', backgroundColor: '#8B1538'}}></div>
                                            </div>
                                            <span className="progress-percentage">90%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overview-activities">
                                    <h4>Recent Activities</h4>
                                    <div className="activity-timeline">
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#8B1538'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Submitted Math Assignment</div>
                                                <div className="activity-time">2 days ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#D4AF37'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Achieved Dean's List</div>
                                                <div className="activity-time">1 week ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#A71D45'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Completed Science Project</div>
                                                <div className="activity-time">2 weeks ago</div>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon" style={{backgroundColor: '#C9A961'}}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                                </svg>
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-title">Attended Career Workshop</div>
                                                <div className="activity-time">3 weeks ago</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="student-detail-panel empty-state">
                        <p>Select a student to view details</p>
                    </div>
                )}
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
    );
}
