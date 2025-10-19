import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await axios.get('/api/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-page">
            <div className="content-intro" style={{marginBottom:'16px'}}>
                <h1 style={{margin:'0 0 6px 0'}}>Admin Dashboard</h1>
                <p style={{margin:0, color:'var(--text-secondary)'}}>Manage your university's academic structure and operations</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats?.total_departments ?? 0}</div>
                    <div className="stat-label">Total Departments</div>
                    <div className="stat-change">{stats?.dept_change_text || ''}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats?.total_faculty ?? 0}</div>
                    <div className="stat-label">Total Faculty</div>
                    <div className="stat-change">{stats?.faculty_change_text || ''}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats?.total_students ?? 0}</div>
                    <div className="stat-label">Total Students</div>
                    <div className="stat-change">{stats?.student_change_text || ''}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats?.active_semesters ?? 0}</div>
                    <div className="stat-label">Active Semesters</div>
                    <div className="stat-change">{stats?.current_term || ''}</div>
                </div>
            </div>

            <div className="action-cards">
                <Link to="/settings/departments" className="action-card link-card">
                    <div className="action-image">
                        <img src="/images/Department.png" alt="Departments" />
                    </div>
                    <h3 className="action-title">Manage Departments</h3>
                    <p className="action-desc">Add, edit, or remove academic departments</p>
                </Link>
                <Link to="/faculty" className="action-card link-card">
                    <div className="action-image">
                        <img src="/images/Faculty.png" alt="Faculty" />
                    </div>
                    <h3 className="action-title">Manage Faculty</h3>
                    <p className="action-desc">Add new faculty members and manage existing ones</p>
                </Link>
                <Link to="/students" className="action-card link-card">
                    <div className="action-image">
                        <img src="/images/student.png" alt="Students" />
                    </div>
                    <h3 className="action-title">Manage Students</h3>
                    <p className="action-desc">Add new students and manage student records</p>
                </Link>
            </div>
        </div>
    );
}
