import React from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
    const cards = [
        { key: 'schoolYear', label: 'School Year', to: '/settings/school-year' },
        { key: 'departments', label: 'Departments', to: '/settings/departments' },
        { key: 'courses', label: 'Courses', to: '/settings/courses' },
        { key: 'subjects', label: 'Subjects', to: '/settings/subjects' },
        { key: 'activeCourse', label: 'Active Course', to: '/settings/active-course' },
    ];

    return (
        <div className="module-page">
            <div className="page-header">
                <h1>System settings</h1>
            </div>

            <div className="settings-landing">
                <p className="lead">Manage all academic subjects, courses, and their details</p>
                <div className="settings-grid">
                    {cards.map(card => (
                        <Link key={card.key} to={card.to} className="settings-card">
                            <div className="card-value">—</div>
                            <div className="card-label">{card.label}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
