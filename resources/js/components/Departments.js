import React from 'react';

export default function Departments() {
  return (
    <div className="departments-page">
      <div className="module-page">
        <div className="page-header">
          <h1>All Departments</h1>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Chair</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  Departments module coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
