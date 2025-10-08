import React from 'react';

export default function Subjects() {
  return (
    <div className="subjects-page">
      <div className="module-page">
        <div className="page-header">
          <h1>Subjects</h1>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Units</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  Subjects module coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
