import React from 'react';
import FacultyForm from './FacultyForm';

export default function FacultyEditModal({ initialData, onClose, onSaved }) {
  const isEditing = !!(initialData && initialData.id);
  return (
    <div className="student-view-modal">
      <div className="student-edit-card form-card">
        <h2>{isEditing ? 'Edit Faculty' : 'Add New Faculty'}</h2>
        <FacultyForm
          initialData={initialData || undefined}
          onSaved={(saved)=>{ if (onSaved) onSaved(saved); }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
