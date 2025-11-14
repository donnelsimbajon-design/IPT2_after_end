import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiEdit2, FiArchive, FiRotateCcw, FiTrash2, FiCalendar, FiUsers, FiBook, FiPlus, FiSave } from 'react-icons/fi';
import { HiAcademicCap, HiOfficeBuilding } from 'react-icons/hi';

export default function SchoolYear() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', start_date: '', end_date: '', status: 'Active' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ label: '', start_date: '', end_date: '', status: 'Active' });
  const TARGET_YEAR = 2025;
  const [stats2025, setStats2025] = useState(null);
  const [semesters2025, setSemesters2025] = useState(['1st Semester', '2nd Semester']);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesterStats, setSemesterStats] = useState(null);
  const [selectedYearSemesters, setSelectedYearSemesters] = useState({}); // Track selected semesters per year
  const [globalStats, setGlobalStats] = useState({ departments: 0, courses: 0, faculty: 0 });

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchYears = async () => {
    try {
      const res = await axios.get('/api/school-years');
      setYears(res.data || []);
    } catch (e) {
      console.error('Failed to load school years', e);
      setMessage('Error loading school years');
    } finally {
      setLoading(false);
    }
  };

  // Derive 2025 counts (students enrolled in 2025, total faculty, total courses) and enforce two-semester view
  useEffect(() => {
    if (loading) return;
    const compute = async () => {
      try {
        // decide semesters from school-year record, fallback to two fixed semester labels
        const matchYear = (y) => {
          const lbl = String(y.label || '');
          if (lbl.includes(String(TARGET_YEAR))) return true;
          const sd = y.start_date ? new Date(y.start_date) : null;
          const ed = y.end_date ? new Date(y.end_date) : null;
          return (sd && sd.getFullYear() === TARGET_YEAR) || (ed && ed.getFullYear() === TARGET_YEAR);
        };
        const y2025 = years.find(matchYear);
        if (y2025 && Array.isArray(y2025.semesters) && y2025.semesters.length === 2) {
          setSemesters2025(y2025.semesters.map(s => s.name || s));
        } else {
          setSemesters2025(['1st Semester', '2nd Semester']);
        }

        // Students count for 2025
        let studentsCount = 0;
        try {
          const resStudents = await axios.get('/api/students', { params: { school_year: TARGET_YEAR } });
          const arr = Array.isArray(resStudents.data) ? resStudents.data : [];
          studentsCount = arr.length;
        } catch (_) {
          try {
            const resAll = await axios.get('/api/students');
            const arrAll = Array.isArray(resAll.data) ? resAll.data : [];
            studentsCount = arrAll.filter(s => {
              const d = s.enrollment_date ? new Date(s.enrollment_date) : null;
              return d && d.getFullYear() === TARGET_YEAR;
            }).length;
          } catch (_) { studentsCount = 0; }
        }

        // Total faculty
        let facultyCount = 0;
        try {
          const resFac = await axios.get('/api/faculties');
          facultyCount = Array.isArray(resFac.data) ? resFac.data.length : (Array.isArray(resFac.data?.faculties) ? resFac.data.faculties.length : 0);
        } catch (_) { facultyCount = 0; }

        // Total courses (from settings)
        let coursesCount = 0;
        try {
          const resCourses = await axios.get('/api/settings/key/courses');
          const raw = resCourses.data?.setting_value;
          try {
            const parsed = JSON.parse(raw || '[]');
            coursesCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch { coursesCount = 0; }
        } catch (_) { coursesCount = 0; }

        // Total departments (from departments table)
        let departmentsCount = 0;
        try {
          const resDepts = await axios.get('/api/departments');
          departmentsCount = Array.isArray(resDepts.data) ? resDepts.data.length : 0;
        } catch (_) { departmentsCount = 0; }

        // Store global stats for all year cards
        setGlobalStats({ departments: departmentsCount, courses: coursesCount, faculty: facultyCount });

        setStats2025({ students: studentsCount, faculty: facultyCount, courses: coursesCount, departments: departmentsCount });
      } catch (e) {
        // Non-fatal: just omit stats
        setStats2025({ students: 0, faculty: 0, courses: 0 });
      }
    };
    compute();
  }, [loading, years]);

  const current = useMemo(() => {
    if (!years.length) return null;
    const actives = years.filter(y => (y.status || '').toLowerCase() === 'active');
    const byStart = [...actives].sort((a, b) => new Date(b.start_date || '1970-01-01') - new Date(a.start_date || '1970-01-01'));
    const y = byStart[0] || years[0];
    return {
      label: y.label,
      stats: {
        semesters: y.semesters_count || (y.semesters ? y.semesters.length : 0) || 0,
        students: y.students_count || 0,
        faculty: 0,
        courses: 0,
      },
    };
  }, [years]);

  const startEdit = (y) => {
    setEditingId(y.id);
    setEditForm({
      label: y.label || '',
      start_date: y.start_date ? String(y.start_date).slice(0, 10) : '',
      end_date: y.end_date ? String(y.end_date).slice(0, 10) : '',
      status: y.status || 'Active',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/api/school-years/${id}`, editForm);
      setMessage('Academic year updated');
      setEditingId(null);
      fetchYears();
    } catch (e) {
      console.error('Failed to update', e);
      setMessage(e.response?.data?.message || 'Error updating');
    }
  };

  const archiveYear = async (id) => {
    if (!confirm('Archive this academic year?')) return;
    try {
      await axios.post(`/api/school-years/${id}/archive`);
      setMessage('Archived successfully');
      fetchYears();
    } catch (e) {
      console.error('Archive failed', e);
      setMessage('Archive failed');
    }
  };

  const unarchiveYear = async (id) => {
    try {
      await axios.post(`/api/school-years/${id}/unarchive`);
      setMessage('Unarchived successfully');
      fetchYears();
    } catch (e) {
      console.error('Unarchive failed', e);
      setMessage('Unarchive failed');
    }
  };

  const deleteYear = async (id) => {
    if (!confirm('Are you sure you want to delete this academic year? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/school-years/${id}`);
      setMessage('Academic year deleted successfully');
      fetchYears();
    } catch (e) {
      console.error('Delete failed', e);
      setMessage(e.response?.data?.message || 'Error deleting academic year');
    }
  };

  const handleSemesterClick = async (semesterName, index) => {
    if (selectedSemester === semesterName) {
      // Close if clicking the same semester
      setSelectedSemester(null);
      setSemesterStats(null);
      return;
    }

    setSelectedSemester(semesterName);
    
    try {
      // First, get all semesters to find the ID of the selected semester
      let semesterId = null;
      try {
        const resSemesters = await axios.get('/api/semesters');
        const semesters = Array.isArray(resSemesters.data) ? resSemesters.data : [];
        const semester = semesters.find(s => s.name === semesterName);
        semesterId = semester?.id;
      } catch (_) { }

      // Get students count for this semester
      let studentsCount = 0;
      try {
        const resStudents = await axios.get('/api/students');
        const students = Array.isArray(resStudents.data) ? resStudents.data : [];
        // Filter students for this semester
        studentsCount = students.filter(s => {
          if (s.status === 'Archived') return false;
          // Filter by semester_id if available
          if (semesterId && s.semester_id) {
            return s.semester_id === semesterId;
          }
          // Otherwise count all active students
          return true;
        }).length;
      } catch (_) { studentsCount = 0; }

      // Get faculty count for this semester
      let facultyCount = 0;
      try {
        const resFaculty = await axios.get('/api/faculties');
        const faculties = Array.isArray(resFaculty.data) ? resFaculty.data : [];
        // Filter faculty for this semester
        facultyCount = faculties.filter(f => {
          if (f.status === 'Archived') return false;
          // Filter by semester_id if available
          if (semesterId && f.semester_id) {
            return f.semester_id === semesterId;
          }
          // Otherwise count all active faculty
          return true;
        }).length;
      } catch (_) { facultyCount = 0; }

      // Get total courses count (not semester-specific)
      let coursesCount = 0;
      try {
        const resCourses = await axios.get('/api/settings/key/courses');
        const raw = resCourses.data?.setting_value;
        const parsed = JSON.parse(raw || '[]');
        coursesCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (_) { coursesCount = 0; }

      // Get total departments count (not semester-specific)
      let departmentsCount = 0;
      try {
        const resDepts = await axios.get('/api/departments');
        departmentsCount = Array.isArray(resDepts.data) ? resDepts.data.length : 0;
      } catch (_) { departmentsCount = 0; }

      setSemesterStats({
        students: studentsCount,
        faculty: facultyCount,
        courses: coursesCount,
        departments: departmentsCount
      });
    } catch (e) {
      console.error('Error fetching semester stats', e);
      setSemesterStats({ students: 0, faculty: 0, courses: 0, departments: 0 });
    }
  };

  const handleYearSemesterClick = async (yearId, semesterId, semesterName) => {
    const key = `${yearId}-${semesterId}`;
    
    if (selectedYearSemesters[key]) {
      // Close if clicking the same semester
      const newState = { ...selectedYearSemesters };
      delete newState[key];
      setSelectedYearSemesters(newState);
      return;
    }

    try {
      // Get students count for this semester
      let studentsCount = 0;
      try {
        const resStudents = await axios.get('/api/students');
        const students = Array.isArray(resStudents.data) ? resStudents.data : [];
        // Filter students for this semester AND school year
        studentsCount = students.filter(s => {
          if (s.status === 'Archived') return false;
          // Must match semester_id
          if (s.semester_id !== semesterId) return false;
          // Must be linked to this school year
          if (s.school_years && Array.isArray(s.school_years)) {
            return s.school_years.some(sy => sy.id === yearId);
          }
          return false;
        }).length;
      } catch (_) { studentsCount = 0; }

      // Get faculty count for this semester
      let facultyCount = 0;
      try {
        const resFaculty = await axios.get('/api/faculties');
        const faculties = Array.isArray(resFaculty.data) ? resFaculty.data : [];
        // Filter faculty for this semester AND school year
        facultyCount = faculties.filter(f => {
          if (f.status === 'Archived') return false;
          // Must match semester_id
          if (f.semester_id !== semesterId) return false;
          // Must be linked to this school year
          if (f.school_years && Array.isArray(f.school_years)) {
            return f.school_years.some(sy => sy.id === yearId);
          }
          return false;
        }).length;
      } catch (_) { facultyCount = 0; }

      // Get total courses count (not semester-specific)
      let coursesCount = 0;
      try {
        const resCourses = await axios.get('/api/settings/key/courses');
        const raw = resCourses.data?.setting_value;
        const parsed = JSON.parse(raw || '[]');
        coursesCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (_) { coursesCount = 0; }

      // Get total departments count (not semester-specific)
      let departmentsCount = 0;
      try {
        const resDepts = await axios.get('/api/departments');
        departmentsCount = Array.isArray(resDepts.data) ? resDepts.data.length : 0;
      } catch (_) { departmentsCount = 0; }

      setSelectedYearSemesters({
        ...selectedYearSemesters,
        [key]: {
          students: studentsCount,
          faculty: facultyCount,
          courses: coursesCount,
          departments: departmentsCount
        }
      });
    } catch (e) {
      console.error('Error fetching semester stats', e);
      setSelectedYearSemesters({
        ...selectedYearSemesters,
        [key]: { students: 0, faculty: 0, courses: 0, departments: 0 }
      });
    }
  };

  const createYear = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/school-years', createForm);
      setMessage('Academic year created');
      setShowCreate(false);
      setCreateForm({ label: '', start_date: '', end_date: '', status: 'Active' });
      fetchYears();
    } catch (err) {
      console.error('Create failed', err);
      setMessage(err.response?.data?.message || 'Error creating academic year');
    }
  };

  const Stat = ({ value, label }) => (
    <div className="sy-stat">
      <div className="value">{value.toLocaleString()}</div>
      <div className="label">{label}</div>
    </div>
  );

  const StatusBadge = ({ status, children }) => (
    <span className={`status-badge ${status.toLowerCase()}`}>{children || status}</span>
  );

  return (
    <div className="students-page">
    <div className="module-page school-year-page">
      <div className="page-header">
        <div>
          <h1><FiCalendar className="page-icon" />Academic Year Management</h1>
          <p className="page-subtitle">Manage academic years and their configurations</p>
        </div>
        <button className={`btn ${showCreate ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setShowCreate(v => !v)}>
          {showCreate ? <><FiX /> Cancel</> : <><FiPlus /> Add Academic Year</>}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <div className="loading">Loading...</div>}

      {showCreate && (
        <div className="sy-card" style={{ marginBottom: '16px' }}>
          <h2 style={{ marginTop: 0 }}><FiPlus className="section-icon" />Add Academic Year</h2>
          <form className="module-form" onSubmit={createYear}>
            <div className="form-row">
              <input
                name="label"
                placeholder="Label (e.g., 2024–2025)"
                value={createForm.label}
                onChange={(e)=>setCreateForm({ ...createForm, label: e.target.value })}
                required
              />
              <input
                type="date"
                name="start_date"
                placeholder="Start Date"
                value={createForm.start_date}
                onChange={(e)=>setCreateForm({ ...createForm, start_date: e.target.value })}
              />
              <input
                type="date"
                name="end_date"
                placeholder="End Date"
                value={createForm.end_date}
                onChange={(e)=>setCreateForm({ ...createForm, end_date: e.target.value })}
              />
            </div>
            <div className="form-row">
              <select
                name="status"
                value={createForm.status}
                onChange={(e)=>setCreateForm({ ...createForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary"><FiCheck /> Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}><FiX /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Current Academic Year Summary */}
      {current && (
        <div className="sy-card current-year">
          <div className="sy-card-header">
            <h2>Current Academic Year</h2>
            <StatusBadge status="active">{current.label}</StatusBadge>
          </div>
          <div className="stats-grid">
            <Stat value={current.stats.semesters} label="Total Semesters" />
            <Stat value={current.stats.students} label="Total Students" />
            <Stat value={current.stats.faculty} label="Total Faculty" />
            <Stat value={current.stats.courses} label="Total Courses" />
          </div>
        </div>
      )}

      {/* Academic Year 2025 Overview */}
      <div className="sy-card">
        <div className="sy-card-header">
          <h2>Academic Year 2025 Overview</h2>
          <StatusBadge status="active">2025</StatusBadge>
        </div>
        <div className="stats-grid">
          <Stat value={2} label="Total Semesters" />
          <Stat value={stats2025?.students || 0} label="Total Students" />
          <Stat value={stats2025?.faculty || 0} label="Total Faculty" />
          <Stat value={stats2025?.courses || 0} label="Total Courses" />
          <Stat value={stats2025?.departments || 0} label="Total Departments" />
        </div>
        <div className="sy-semesters">
          <div className="section-title">Semesters</div>
          <div className="semester-list">
            {semesters2025.map((name, idx) => (
              <div key={name + idx}>
                <div 
                  className={`semester-item ${selectedSemester === name ? 'active' : ''}`}
                  onClick={() => handleSemesterClick(name, idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="sem-name">{name}</div>
                  <div className="sem-range">—</div>
                </div>
                {selectedSemester === name && semesterStats && (
                  <div className="semester-stats" style={{ 
                    marginTop: '12px', 
                    padding: '16px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div className="stats-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '16px' 
                    }}>
                      <Stat value={semesterStats.students} label="Total Students" />
                      <Stat value={semesterStats.courses} label="Total Courses" />
                      <Stat value={semesterStats.departments} label="Total Departments" />
                      <Stat value={semesterStats.faculty} label="Total Faculty" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Year Management List */}
      <div className="sy-section">
        <h3>Academic Year Management</h3>

        {years.map((y) => (
          <div key={y.id || y.label} className="sy-year-card">
            <div className="sy-year-header">
              <div className="title-row">
                <h4>{y.label}</h4>
                <StatusBadge status={y.status}>{y.status}</StatusBadge>
              </div>
              <div className="meta-grid">
                <div>
                  <div className="meta-label">Start Date</div>
                  <div className="meta-value">{y.start_date ? new Date(y.start_date).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div className="meta-label">End Date</div>
                  <div className="meta-value">{y.end_date ? new Date(y.end_date).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div className="meta-label">Total Students</div>
                  <div className="meta-value">{(y.students_count || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="meta-label">Total Faculty</div>
                  <div className="meta-value">{globalStats.faculty.toLocaleString()}</div>
                </div>
                <div>
                  <div className="meta-label">Total Courses</div>
                  <div className="meta-value">{globalStats.courses.toLocaleString()}</div>
                </div>
                <div>
                  <div className="meta-label">Total Departments</div>
                  <div className="meta-value">{globalStats.departments.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="sy-semesters">
              <div className="section-title">Semesters</div>
              <div className="semester-list">
                {(y.semesters || []).map((s) => {
                  const key = `${y.id}-${s.id}`;
                  const isSelected = !!selectedYearSemesters[key];
                  return (
                    <div key={s.id || s.name}>
                      <div 
                        className={`semester-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleYearSemesterClick(y.id, s.id, s.name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="sem-name">{s.name}</div>
                        <div className="sem-range">{`${s.start_date ? new Date(s.start_date).toLocaleDateString() : '-'} — ${s.end_date ? new Date(s.end_date).toLocaleDateString() : '-'}`}</div>
                      </div>
                      {isSelected && selectedYearSemesters[key] && (
                        <div className="semester-stats" style={{ 
                          marginTop: '12px', 
                          padding: '16px', 
                          background: '#f8f9fa', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <div className="stats-grid" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: '16px' 
                          }}>
                            <Stat value={selectedYearSemesters[key].students} label="Total Students" />
                            <Stat value={selectedYearSemesters[key].courses} label="Total Courses" />
                            <Stat value={selectedYearSemesters[key].departments} label="Total Departments" />
                            <Stat value={selectedYearSemesters[key].faculty} label="Total Faculty" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sy-actions">
              {editingId === y.id ? (
                <>
                  <button className="btn btn-primary" onClick={() => saveEdit(y.id)}>
                    <FiSave style={{ marginRight: '6px' }} />
                    Save
                  </button>
                  <button className="btn btn-secondary" onClick={cancelEdit}>
                    <FiX style={{ marginRight: '6px' }} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => startEdit(y)}>
                    <FiEdit2 style={{ marginRight: '6px' }} />
                    Edit
                  </button>
                  {String(y.status).toLowerCase() === 'archived' ? (
                    <button className="btn" onClick={() => unarchiveYear(y.id)}>
                      <FiRotateCcw style={{ marginRight: '6px' }} />
                      Unarchive
                    </button>
                  ) : (
                    <button className="btn btn-danger" onClick={() => archiveYear(y.id)}>
                      <FiArchive style={{ marginRight: '6px' }} />
                      Archive
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => deleteYear(y.id)}>
                    <FiTrash2 style={{ marginRight: '6px' }} />
                    Delete
                  </button>
                </>
              )}
            </div>

            {editingId === y.id && (
              <div className="form-card" style={{marginTop: '12px'}}>
                <h2><FiEdit2 className="section-icon" />Edit Academic Year</h2>
                <form className="module-form" onSubmit={(e) => { e.preventDefault(); saveEdit(y.id); }}>
                  <div className="form-row">
                    <input name="label" placeholder="Label (e.g., 2024–2025)" value={editForm.label} onChange={(e)=>setEditForm({...editForm, label: e.target.value})} required />
                    <input type="date" name="start_date" placeholder="Start Date" value={editForm.start_date} onChange={(e)=>setEditForm({...editForm, start_date: e.target.value})} />
                    <input type="date" name="end_date" placeholder="End Date" value={editForm.end_date} onChange={(e)=>setEditForm({...editForm, end_date: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <select name="status" value={editForm.status} onChange={(e)=>setEditForm({...editForm, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary"><FiSave /> Save</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}><FiX /> Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
