import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerator, setShowGenerator] = useState(false);
    const [message, setMessage] = useState(null);
    const [generatedData, setGeneratedData] = useState(null);
    const [formData, setFormData] = useState({
        report_name: '',
        report_type: 'students',
        description: '',
        parameters: {}
    });

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setMessage('Error loading reports');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/reports/generate', formData);
            setMessage('Report generated successfully');
            setGeneratedData(response.data.data);
            fetchReports();
        } catch (error) {
            console.error('Error generating report:', error);
            setMessage(error.response?.data?.message || 'Error generating report');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        try {
            await axios.delete(`/api/reports/${id}`);
            setMessage('Report deleted successfully');
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            setMessage('Error deleting report');
        }
    };

    const createArchiveFromReport = async (report) => {
        const archiveId = `REP-${report.id}-${Date.now()}`;
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const payload = {
            archive_id: archiveId,
            title: report.report_name || 'Report',
            description: `Archived Report (${report.report_type})`,
            document_type: 'Report',
            category: 'Record',
            department: '',
            reference_number: String(report.id),
            archived_date: ymd,
            status: 'Archived',
            tags: 'report',
        };
        await axios.post('/api/archives', payload);
    };

    const handleArchive = async (report) => {
        if (!confirm('Archive this report?')) return;
        try {
            await axios.put(`/api/reports/${report.id}`, { status: 'Archived' });
            try { await createArchiveFromReport(report); } catch (e) { console.error('Archive create failed', e); }
            setMessage('Report archived successfully');
            fetchReports();
        } catch (error) {
            console.error('Error archiving report:', error);
            setMessage('Error archiving report');
        }
    };

    const resetForm = () => {
        setFormData({
            report_name: '',
            report_type: 'students',
            description: '',
            parameters: {}
        });
        setShowGenerator(false);
        setGeneratedData(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="loading">Loading reports...</div>;

    return (
        <div className="reports-page">
        <div className="module-page">
            <div className="page-header">
                <h1>Reports Management</h1>
                <button className="btn btn-primary" onClick={() => setShowGenerator(!showGenerator)}>
                    {showGenerator ? 'Cancel' : '+ Generate Report'}
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            {showGenerator && (
                <div className="form-card">
                    <h2>Generate New Report</h2>
                    <form onSubmit={handleGenerate} className="module-form">
                        <div className="form-row">
                            <input 
                                name="report_name" 
                                placeholder="Report Name *" 
                                value={formData.report_name} 
                                onChange={handleChange} 
                                required 
                            />
                            <select name="report_type" value={formData.report_type} onChange={handleChange}>
                                <option value="students">Students Report</option>
                                <option value="faculty">Faculty Report</option>
                                <option value="enrollment">Enrollment Report</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <textarea 
                                name="description" 
                                placeholder="Description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Generate Report</button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>

                    {generatedData && (
                        <div className="report-preview">
                            <h3>Report Preview</h3>
                            <pre>{JSON.stringify(generatedData, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Generated By</th>
                            <th>Generated At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.report_name}</td>
                                <td>{report.report_type}</td>
                                <td>{report.description}</td>
                                <td>{report.generated_by?.name || 'N/A'}</td>
                                <td>{report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</td>
                                <td><span className={`badge badge-${report.status.toLowerCase()}`}>{report.status}</span></td>
                                <td className="actions">
                                    <button className="btn-icon btn-delete" onClick={() => handleDelete(report.id)}>Delete</button>
                                    {report.status !== 'Archived' && (
                                        <button className="btn-icon" onClick={() => handleArchive(report)}>Archive</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}
