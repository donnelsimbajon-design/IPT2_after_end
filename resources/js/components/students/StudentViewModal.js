import React, { useEffect } from 'react';

export default function StudentViewModal({
  initialData,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}) {
  const student = initialData || null;
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
          <h2>Student Details</h2>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="student-cell">
          <div className="avatar">
            {student?.avatar_path ? (
              <img src={student.avatar_path.startsWith('http') ? student.avatar_path : `/${student.avatar_path}`} alt="Avatar" />
            ) : (
              <span>{(student?.first_name || student?.last_name || 'S').toString().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="info">
            <div className="name">{student?.first_name} {student?.last_name}</div>
            <div className="sub">{student?.email}</div>
          </div>
        </div>
        <div className="meta-strip">
          <div className="pill id-pill">ID: {student?.student_id || '-'}</div>
          <div className="pill dept-pill">Department: {student?.department || student?.program || '-'}</div>
          <div>
            <span className={`badge badge-${String(student?.status || 'Active').toLowerCase().replace(' ', '-')}`}>{student?.status || 'Active'}</span>
          </div>
        </div>
        <div className="details">
          <div><strong>Student ID:</strong> {student?.student_id || '-'}</div>
          <div><strong>Status:</strong> {student?.status || 'Active'}</div>
          <div><strong>Department:</strong> {student?.department || student?.program || '-'}</div>
          <div><strong>Course:</strong> {student?.course || '-'}</div>
          <div><strong>Year Level:</strong> {student?.year_level || '-'}</div>
          <div><strong>School Year(s):</strong> {
            student?.school_years && student.school_years.length > 0 
              ? student.school_years.map(sy => sy.label).join(', ')
              : '-'
          }</div>
          <div><strong>Semester:</strong> {student?.semester?.name || '-'}</div>
          <div><strong>Enrollment Date:</strong> {fmtDMY(student?.enrollment_date)}</div>
          <div><strong>Phone:</strong> {student?.phone || '-'}</div>
          <div><strong>Region:</strong> {student?.region || '-'}</div>
          <div><strong>Province:</strong> {student?.province || '-'}</div>
          <div><strong>City:</strong> {student?.city || '-'}</div>
          <div><strong>Address:</strong> {student?.address || '-'}</div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => { if (onEdit) onEdit(student); }}>Edit</button>
          {student && (
            <>
              <button className="btn btn-secondary" onClick={() => { if (onDelete) onDelete(student.id); }}>Delete</button>
              {student.status !== 'Archived' ? (
                <button className="btn btn-secondary" onClick={() => { if (onArchive) onArchive(student); }}>Archive</button>
              ) : (
                <button className="btn btn-secondary" onClick={() => { if (onUnarchive) onUnarchive(student); }}>Unarchive</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
