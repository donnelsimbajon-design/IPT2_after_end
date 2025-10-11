import React from 'react';
import StudentForm from './StudentForm';

export default function StudentEditModal({ initialData, onClose, onSaved }) {
  const isEditing = !!(initialData && initialData.id);
  return (
    <div className="student-view-modal">
      <div className="student-edit-card form-card">
        <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <StudentForm
          initialData={initialData || undefined}
          onSaved={(saved)=>{ if (onSaved) onSaved(saved); }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
