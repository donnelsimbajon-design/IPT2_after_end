import React from 'react';
import { FiX } from 'react-icons/fi';
import StudentForm from './StudentForm';

export default function StudentEditModal({ initialData, onClose, onSaved }) {
  const isEditing = !!(initialData && initialData.id);
  return (
    <div className="student-edit-modal">
      <div className="student-edit-card form-card">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="close-button" onClick={onClose} title="Close">
            <FiX />
          </button>
        </div>
        <StudentForm
          initialData={initialData || undefined}
          onSaved={(saved)=>{ if (onSaved) onSaved(saved); }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
