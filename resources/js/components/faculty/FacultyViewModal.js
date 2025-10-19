import React from 'react';

export default function FacultyViewModal({
  initialData,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}) {
  const faculty = initialData || null;

  return (
    <div className="student-view-modal">
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
        <div className="details">
          <div><strong>Faculty ID:</strong> {faculty?.faculty_id || '-'}</div>
          <div><strong>Status:</strong> {faculty?.status || 'Active'}</div>
          <div><strong>Department:</strong> {faculty?.department || '-'}</div>
          <div><strong>Position:</strong> {faculty?.position || '-'}</div>
          <div><strong>Employment Type:</strong> {faculty?.employment_type || '-'}</div>
          <div><strong>Hire Date:</strong> {faculty?.hire_date ? new Date(faculty.hire_date).toISOString().slice(0,10) : '-'}</div>
          <div><strong>Phone:</strong> {faculty?.phone || '-'}</div>
          <div><strong>City:</strong> {faculty?.city || '-'}</div>
          <div><strong>Address:</strong> {faculty?.address || '-'}</div>
        </div>
        <div className="form-actions">
          {/* Actions removed: Edit, Delete, Archive per request */}
        </div>
      </div>
    </div>
  );
}
