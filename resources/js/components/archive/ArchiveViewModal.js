import React, { useState } from 'react';

export default function ArchiveViewModal({ initialData, onClose, onDelete, onUnarchive, onSave }) {
  const archive = initialData || null;
  const [unarchived, setUnarchived] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [documentDate, setDocumentDate] = useState(archive?.document_date ? archive.document_date.slice(0,10) : '');
  const [dateError, setDateError] = useState(null);

  const handleUnarchiveClick = async () => {
    if (!onUnarchive) return;
    setProcessing(true);
    try {
      await onUnarchive(archive);
      setUnarchived(true);
    } catch (e) {
      // onUnarchive already handles errors and messages
    }
    setProcessing(false);
  };

  const toggleEditDate = () => {
    setDateError(null);
    setEditingDate(prev => !prev);
    setDocumentDate(archive?.document_date ? archive.document_date.slice(0,10) : '');
  };

  const saveDate = async () => {
    // basic validation: not empty, not a future date
    if (!documentDate) {
      setDateError('Document date is required');
      return;
    }
    const chosen = new Date(documentDate);
    const now = new Date();
    if (chosen > now) {
      setDateError('Document date cannot be in the future');
      return;
    }
    setProcessing(true);
    try {
      if (onSave && archive?.id) {
        await onSave(archive.id, { document_date: documentDate });
      }
      setEditingDate(false);
      setDateError(null);
    } catch (e) {
      setDateError('Failed to save date');
    }
    setProcessing(false);
  };

  return (
    <div className="student-view-modal">
      <div className="student-view-card">
        <div className="page-header">
          <h2>Archive Details</h2>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="details">
          <div><strong>Archive ID:</strong> {archive?.archive_id || '-'}</div>
          <div><strong>Title:</strong> {archive?.title || '-'}</div>
          <div><strong>Document Type:</strong> {archive?.document_type || '-'}</div>
          <div><strong>Category:</strong> {archive?.category || '-'}</div>
          <div><strong>Department:</strong> {archive?.department || '-'}</div>
          <div><strong>Reference #:</strong> {archive?.reference_number || '-'}</div>
          <div>
            <strong>Document Date:</strong>{' '}
            {!editingDate ? (
              <span>{archive?.document_date ? new Date(archive.document_date).toISOString().slice(0,10) : '-'}</span>
            ) : (
              <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
            )}
            {' '}
            <button className="btn btn-link" onClick={toggleEditDate}>{editingDate ? 'Cancel' : 'Edit'}</button>
            {editingDate && (
              <button className="btn btn-primary" onClick={saveDate} disabled={processing} style={{marginLeft: '8px'}}>{processing ? 'Saving...' : 'Save'}</button>
            )}
            {dateError && <div style={{color: 'var(--danger, #c00)', marginTop: '6px'}}>{dateError}</div>}
          </div>
          <div style={{marginTop: '12px'}}><strong>Description:</strong>
            <div style={{marginTop: '6px'}}>{archive?.description || '-'}</div>
          </div>
        </div>

        <div className="form-actions">
          {/* Unarchive button removed per request; only Delete remains */}
          <button className="btn btn-danger" onClick={() => { if (onDelete) onDelete(archive.id); }}>{'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
