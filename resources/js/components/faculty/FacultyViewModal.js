import React, { useEffect } from 'react';

export default function FacultyViewModal({
  initialData,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}) {
  const faculty = initialData || null;
  const fmtDMY = (s) => {
    if (!s) return '-';
    try {
      const d = new Date(s);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch { return '-'; }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="student-view-modal" onMouseDown={(e)=>{ if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="student-view-card">
        <div className="page-header">
          <h2>Faculty Details</h2>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="student-cell">
          <div className="avatar">
            {faculty?.avatar_path ? (
              <img src={faculty.avatar_path.startsWith('http') ? faculty.avatar_path : `/${faculty.avatar_path}`} alt="Avatar" />
            ) : (
              <span>{(faculty?.first_name || faculty?.last_name || 'F').toString().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="info">
            <div className="name">{faculty?.first_name} {faculty?.last_name}</div>
            <div className="sub">{faculty?.email}</div>
          </div>
        </div>
        <div className="meta-strip">
          <div className="pill id-pill">ID: {faculty?.faculty_id || '-'}</div>
          <div className="pill dept-pill">Department: {faculty?.department || '-'}</div>
          <div>
            <span className={`badge badge-${String(faculty?.status || 'Active').toLowerCase().replace(' ', '-')}`}>{faculty?.status || 'Active'}</span>
          </div>
        </div>
        <div className="details">
          <div><strong>Faculty ID:</strong> {faculty?.faculty_id || '-'}</div>
          <div><strong>Status:</strong> {faculty?.status || 'Active'}</div>
          <div><strong>Department:</strong> {faculty?.department || '-'}</div>
          <div><strong>Position:</strong> {faculty?.position || '-'}</div>
          <div><strong>Employment Type:</strong> {faculty?.employment_type || '-'}</div>
          <div><strong>School Year(s):</strong> {
            faculty?.school_years && faculty.school_years.length > 0 
              ? faculty.school_years.map(sy => sy.label).join(', ')
              : '-'
          }</div>
          <div><strong>Semester:</strong> {faculty?.semester?.name || '-'}</div>
          <div><strong>Hire Date:</strong> {fmtDMY(faculty?.hire_date)}</div>
          <div><strong>Phone:</strong> {faculty?.phone || '-'}</div>
          <div><strong>City:</strong> {faculty?.city || '-'}</div>
          <div><strong>Address:</strong> {faculty?.address || '-'}</div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => { if (onEdit) onEdit(faculty); }}>Edit</button>
          {faculty && (
            <>
              <button className="btn btn-secondary" onClick={() => { if (onDelete) onDelete(faculty.id); }}>Delete</button>
              {faculty.status !== 'Archived' ? (
                <button className="btn btn-secondary" onClick={() => { if (onArchive) onArchive(faculty); }}>Archive</button>
              ) : (
                <button className="btn btn-secondary" onClick={() => { if (onUnarchive) onUnarchive(faculty); }}>Unarchive</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
