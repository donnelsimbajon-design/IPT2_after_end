import React, { useState } from 'react';
import { FiCalendar, FiBook, FiGrid, FiLayers, FiBookmark } from 'react-icons/fi';
import SchoolYear from './settings/SchoolYear';
import Departments from './settings/Departments';
import Courses from './settings/Courses';
import Subjects from './settings/Subjects';
import Calendar from './settings/Calendar';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('schoolYear');

    const tabs = [
        { key: 'schoolYear', label: 'School Year', icon: FiCalendar, component: SchoolYear },
        { key: 'departments', label: 'Departments', icon: FiGrid, component: Departments },
        { key: 'courses', label: 'Courses', icon: FiLayers, component: Courses },
        { key: 'subjects', label: 'Subjects', icon: FiBook, component: Subjects },
        { key: 'calendar', label: 'Calendar', icon: FiBookmark, component: Calendar },
    ];

    const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component;

    return (
        <div className="settings-page-tabbed">
            <div className="page-header">
                <h1>System Settings</h1>
                <p className="subtitle">Manage academic configuration and system parameters</p>
            </div>

            <div className="settings-tabs-container">
                <div className="settings-tabs">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <Icon className="tab-icon" />
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="settings-tab-content">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}

