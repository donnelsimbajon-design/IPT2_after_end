import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DeptPeopleListModal from './DeptPeopleListModal';

export default function DepartmentModule() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ faculty: 0, students: 0, semesters: 0 });
  const [listType, setListType] = useState(null); // 'students' | 'faculty'

  const currentDept = useMemo(() => {
    return departments.find(d => String(d.code).toLowerCase() === String(code || '').toLowerCase());
  }, [departments, code]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(Array.isArray(res.data) ? res.data : (res.data?.departments || []));
      } catch (e) {
        setDepartments([]);
        setMessage('Unable to load departments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchStats = async (deptCode) => {
      if (!deptCode) { setStats({ faculty: 0, students: 0, semesters: 0 }); return; }
      try {
        const [facRes, stuRes, yearsRes] = await Promise.all([
          axios.get('/api/faculties', { params: { department: deptCode } }),
          axios.get('/api/students', { params: { department: deptCode } }),
          axios.get('/api/school-years'),
        ]);
        const facultyCount = Array.isArray(facRes.data) ? facRes.data.length : 0;
        const studentCount = Array.isArray(stuRes.data) ? stuRes.data.length : 0;
        const years = Array.isArray(yearsRes.data) ? yearsRes.data : [];
        const activeSemesters = years
          .filter(y => String(y.status || '').toLowerCase() === 'active')
          .reduce((sum, y) => sum + (y.semesters_count || (Array.isArray(y.semesters) ? y.semesters.length : 0) || 0), 0);
        setStats({ faculty: facultyCount, students: studentCount, semesters: activeSemesters });
      } catch {
        setStats({ faculty: 0, students: 0, semesters: 0 });
      }
    };
    fetchStats(code);
  }, [code]);

  const onSelectDept = (e) => {
    const newCode = e.target.value;
    if (!newCode) return;
    navigate(`/settings/departments/${encodeURIComponent(newCode)}`);
  };

  if (loading) return <div className="loading">Loading department...</div>;

  return (
    <div className="students-page">
      <div className="module-page school-year-page department-page">
        <div className="page-header dept-toolbar">
          <div className="dept-toolbar-left">
            <h1>Departments</h1>
            <div className="dept-picker">
              <span className="label">Select Department</span>
              <select value={code || ''} onChange={onSelectDept}>
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id || d.code} value={d.code}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="dept-toolbar-right">
            <button className="btn" onClick={() => navigate('/settings/departments')}>Back to Management</button>
          </div>
          {listType && (
            <DeptPeopleListModal
              code={code}
              type={listType}
              onClose={() => setListType(null)}
            />
          )}
        </div>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="sy-card" style={{marginBottom:'16px'}}>
          <div className="sy-card-header">
            <h2>
              {currentDept?.name || code}
              <span className="dept-code-pill">{code}</span>
              <span style={{fontWeight:400, color:'var(--text-secondary)'}}>/ Department</span>
            </h2>
          </div>
          <div className="dept-meta-grid">
            <div>
              <div className="meta-label">Code</div>
              <div className="meta-value">{currentDept?.code || code || '—'}</div>
            </div>
            <div>
              <div className="meta-label">Chair</div>
              <div className="meta-value">{currentDept?.chair || '—'}</div>
            </div>
            <div>
              <div className="meta-label">Email</div>
              <div className="meta-value">{currentDept?.email || '—'}</div>
            </div>
            <div>
              <div className="meta-label">Status</div>
              <div className="meta-value">{currentDept?.status || 'Active'}</div>
            </div>
          </div>

          <div style={{marginTop:'12px'}}>
            <h3 style={{margin:'0 0 12px 0'}}>Department Record</h3>
            <div className="stats-grid">
              <div className="stat-card dept-accent">
                <div className="stat-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="3" />
                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </div>
                <div className="stat-value">{stats.faculty}</div>
                <div className="stat-label">Total Faculty</div>
                <div className="stat-change" />
                <div style={{marginTop:'8px'}}>
                  <button className="btn dept-outline" onClick={()=>setListType('faculty')}>View</button>
                </div>
              </div>
              <div className="stat-card dept-accent">
                <div className="stat-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 2 8l10 5 10-5-10-5z" />
                    <path d="M2 8v6a2 2 0 0 0 1 1.7l9 4.3 9-4.3a2 2 0 0 0 1-1.7V8" />
                  </svg>
                </div>
                <div className="stat-value">{stats.students}</div>
                <div className="stat-label">Total Students</div>
                <div className="stat-change" />
                <div style={{marginTop:'8px'}}>
                  <button className="btn dept-outline" onClick={()=>setListType('students')}>View</button>
                </div>
              </div>
              <div className="stat-card dept-accent">
                <div className="stat-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                  </svg>
                </div>
                <div className="stat-value">{stats.semesters}</div>
                <div className="stat-label">Active Semesters</div>
                <div className="stat-change" />
                <div style={{marginTop:'8px'}}>
                  <button className="btn dept-outline" onClick={()=>navigate('/settings/school-year')}>View</button>
                </div>
              </div>
            </div>

            <div style={{marginTop:'16px'}}>
              <div style={{marginBottom:'8px', color:'var(--text-secondary)'}}>Department Overview</div>
              {(() => {
                const values = [stats.students, stats.faculty, stats.semesters];
                const labels = ['Students','Faculty','Semesters'];
                const maxVal = Math.max(1, ...values);
                return (
                  <div className="dept-chart">
                    {values.map((v, i) => (
                      <div key={labels[i]} className="dept-chart-col">
                        <div className="dept-bar-value-badge">{v}</div>
                        <div className="dept-bar" style={{height: `${Math.max(4, Math.round((v / maxVal) * 140))}px`}} />
                        <div className="dept-bar-label">{labels[i]}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
