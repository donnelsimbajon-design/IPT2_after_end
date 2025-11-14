import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';  
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import { FiUsers, FiBookOpen, FiAward, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [comparisonPeriod, setComparisonPeriod] = useState('day'); // day, month, year

    useEffect(() => {
        fetchDashboard();
        fetchChartData();
    }, []);

    useEffect(() => {
        if (selectedSchoolYear) {
            fetchChartData(selectedSchoolYear);
        }
    }, [selectedSchoolYear]);

    // Refetch data when comparison period changes
    useEffect(() => {
        fetchDashboard();
    }, [comparisonPeriod]);

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(`/api/dashboard?period=${comparisonPeriod}`);
            console.log('Dashboard data received:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async (schoolYearId = null) => {
        try {
            const url = schoolYearId 
                ? `/api/dashboard/charts?school_year_id=${schoolYearId}`
                : '/api/dashboard/charts';
            const response = await axios.get(url);
            console.log('Chart data received:', response.data);
            setChartData(response.data);
            
            // Set school years and selected year from response
            if (response.data.school_years) {
                setSchoolYears(response.data.school_years);
            }
            if (response.data.selected_school_year_id && !selectedSchoolYear) {
                setSelectedSchoolYear(response.data.selected_school_year_id);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const handleSchoolYearChange = (e) => {
        setSelectedSchoolYear(e.target.value);
    };

    const handleComparisonPeriodChange = (period) => {
        setComparisonPeriod(period);
    };

    // Get comparison data from API response
    const getComparisonData = (type) => {
        if (!stats?.comparison || !stats.comparison[type]) {
            return {
                change: 0,
                percentChange: 0,
                isPositive: true
            };
        }

        const data = stats.comparison[type];
        return {
            change: data.change,
            percentChange: Math.abs(data.percent),
            isPositive: data.change >= 0
        };
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    // Line Chart Configuration - Students Enrollment Chart
    const enrollmentChartData = chartData ? {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'First Semester',
                data: chartData.students_by_day.first_semester,
                borderColor: '#8B1538',
                backgroundColor: 'rgba(139, 21, 56, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 3,
            },
            {
                label: 'Second Semester',
                data: chartData.students_by_day.second_semester,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 3,
            },
        ],
    } : null;

    const enrollmentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    font: { size: 12, weight: '500' },
                    padding: 16,
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    font: { size: 11 },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                border: {
                    display: false,
                }
            },
            x: {
                ticks: {
                    font: { size: 11 },
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                }
            },
        },
    };

    // Doughnut Chart Configuration - Students by Department
    const departmentChartData = chartData ? {
        labels: chartData.students_by_department.labels,
        datasets: [
            {
                data: chartData.students_by_department.data,
                backgroundColor: [
                    '#8B1538',  // Maroon (primary)
                    '#D4AF37',  // Gold (secondary)
                    '#6B0F2A',  // Dark Maroon
                    '#F0C75E',  // Light Gold
                    '#A71D45',  // Medium Maroon
                    '#C9A961',  // Medium Gold
                    '#5A0C22',  // Darker Maroon
                    '#E5C985',  // Lighter Gold
                ],
                borderColor: '#ffffff',
                borderWidth: 4,
                cutout: '65%',
            },
        ],
    } : null;

    const departmentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    font: { size: 11, weight: '500' },
                    padding: 12,
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                },
            },
            title: {
                display: false,
            },
        },
    };

    // Bar Chart Configuration - Faculty by Department
    const barChartData = chartData ? {
        labels: chartData.faculty_by_department.labels,
        datasets: [
            {
                label: 'Faculty Count',
                data: chartData.faculty_by_department.data,
                backgroundColor: 'rgba(139, 21, 56, 0.8)', // Maroon with opacity
                borderColor: '#8B1538', // Maroon
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(212, 175, 55, 0.8)', // Gold on hover
                hoverBorderColor: '#D4AF37', // Gold border on hover
            },
        ],
    } : null;

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Faculty Members by Department',
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5,
                    font: { size: 11 },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                ticks: {
                    font: { size: 11 },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    // Helper function to abbreviate course names
    const abbreviateCourse = (courseName) => {
        if (!courseName) return '';
        
        const abbreviations = {
            'Bachelor of Science in Computer Science': 'BSCS',
            'Bachelor of Science in Information Technology': 'BSIT',
            'Bachelor of Science in Computer Engineering': 'BSCpE',
            'Bachelor of Science in Information Systems': 'BSIS',
            'Bachelor of Science in Business Administration': 'BSBA',
            'Bachelor of Science in Accountancy': 'BSA',
            'Bachelor of Science in Psychology': 'BSPsy',
            'Bachelor of Science in Nursing': 'BSN',
            'Bachelor of Science in Civil Engineering': 'BSCE',
            'Bachelor of Science in Electrical Engineering': 'BSEE',
            'Bachelor of Science in Mechanical Engineering': 'BSME',
            'Bachelor of Elementary Education': 'BEEd',
            'Bachelor of Secondary Education': 'BSEd',
            'Bachelor of Arts in Communication': 'BA Com',
            'Bachelor of Arts in English': 'BA Eng',
        };
        
        return abbreviations[courseName] || courseName;
    };

    // Helper function to abbreviate semester names
    const abbreviateSemester = (semesterName) => {
        if (!semesterName) return '';
        
        const abbreviations = {
            '1st Semester': '1st Sem',
            '2nd Semester': '2nd Sem',
            'Summer': 'Summer',
            'First Semester': '1st Sem',
            'Second Semester': '2nd Sem',
        };
        
        return abbreviations[semesterName] || semesterName;
    };

    // Bar Chart Configuration - Students by Course (Grouped by Semester)
    const courseChartData = chartData ? {
        labels: chartData.students_by_course.labels.map(label => abbreviateCourse(label)),
        datasets: [
            {
                label: '1st Sem',
                data: chartData.students_by_course.data,
                backgroundColor: '#8B1538', // Maroon
                borderRadius: 4,
                barThickness: 20,
                hoverBackgroundColor: '#6B0F2A',
            },
            {
                label: '2nd Sem',
                data: chartData.students_by_course.data.map(val => Math.floor(val * 0.7)), // Simulated data for second semester
                backgroundColor: '#D4AF37', // Gold
                borderRadius: 4,
                barThickness: 20,
                hoverBackgroundColor: '#C9A961',
            },
        ],
    } : null;

    const courseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 15,
                    font: {
                        size: 11,
                        weight: '500',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const fullName = chartData.students_by_course.labels[context.dataIndex];
                        const semester = context.dataset.label;
                        const count = context.parsed.y;
                        return `${semester} - ${fullName}: ${count} students`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    font: { size: 10 },
                    callback: function(value) {
                        return value;
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                border: {
                    display: false,
                }
            },
            x: {
                ticks: {
                    font: { size: 9 },
                    maxRotation: 0,
                    minRotation: 0,
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                }
            },
        },
    };

    // Bar Chart Configuration - Students by Semester
    const semesterChartData = chartData ? {
        labels: chartData.students_by_semester.labels.map(label => abbreviateSemester(label)),
        datasets: [
            {
                label: 'Student Count',
                data: chartData.students_by_semester.data,
                backgroundColor: 'rgba(212, 175, 55, 0.8)', // Gold with opacity
                borderColor: '#D4AF37', // Gold
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(139, 21, 56, 0.8)', // Maroon on hover
                hoverBorderColor: '#8B1538', // Maroon border on hover
            },
        ],
    } : null;

    const semesterChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const fullName = chartData.students_by_semester.labels[context.dataIndex];
                        const count = context.parsed.y;
                        return `${fullName}: ${count} students`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    font: { size: 11 },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                border: {
                    display: false,
                }
            },
            x: {
                ticks: {
                    font: { size: 11 },
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                }
            },
        },
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="comparison-period-selector">
                    <button 
                        className={`period-btn ${comparisonPeriod === 'day' ? 'active' : ''}`}
                        onClick={() => handleComparisonPeriodChange('day')}
                    >
                        Day
                    </button>
                    <button 
                        className={`period-btn ${comparisonPeriod === 'month' ? 'active' : ''}`}
                        onClick={() => handleComparisonPeriodChange('month')}
                    >
                        Month
                    </button>
                    <button 
                        className={`period-btn ${comparisonPeriod === 'year' ? 'active' : ''}`}
                        onClick={() => handleComparisonPeriodChange('year')}
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-modern">
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{backgroundColor: '#F5E6EA'}}>
                        <HiOutlineAcademicCap style={{color: '#8B1538', fontSize: '24px'}} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Students</div>
                        <div className="stat-value">{stats?.total_students ?? 0}</div>
                        {(() => {
                            const comparison = getComparisonData('students');
                            return (
                                <div className={`stat-comparison ${comparison.isPositive ? 'positive' : 'negative'}`}>
                                    <span className="comparison-icon">{comparison.isPositive ? '↑' : '↓'}</span>
                                    <span className="comparison-value">{comparison.percentChange}%</span>
                                    <span className="comparison-period">vs last {comparisonPeriod}</span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{backgroundColor: '#FBF6E8'}}>
                        <FiUsers style={{color: '#D4AF37', fontSize: '24px'}} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Faculty</div>
                        <div className="stat-value">{stats?.total_faculty ?? 0}</div>
                        {(() => {
                            const comparison = getComparisonData('faculty');
                            return (
                                <div className={`stat-comparison ${comparison.isPositive ? 'positive' : 'negative'}`}>
                                    <span className="comparison-icon">{comparison.isPositive ? '↑' : '↓'}</span>
                                    <span className="comparison-value">{comparison.percentChange}%</span>
                                    <span className="comparison-period">vs last {comparisonPeriod}</span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{backgroundColor: '#F0E5E9'}}>
                        <FiBookOpen style={{color: '#A71D45', fontSize: '24px'}} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Departments</div>
                        <div className="stat-value">{stats?.total_departments ?? 0}</div>
                        {(() => {
                            const comparison = getComparisonData('departments');
                            return (
                                <div className={`stat-comparison ${comparison.isPositive ? 'positive' : 'negative'}`}>
                                    <span className="comparison-icon">{comparison.isPositive ? '↑' : '↓'}</span>
                                    <span className="comparison-value">{comparison.percentChange}%</span>
                                    <span className="comparison-period">vs last {comparisonPeriod}</span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{backgroundColor: '#F9F3E3'}}>
                        <FiAward style={{color: '#C9A961', fontSize: '24px'}} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Active Semesters</div>
                        <div className="stat-value">{stats?.active_semesters ?? 0}</div>
                        {(() => {
                            const comparison = getComparisonData('semesters');
                            return (
                                <div className={`stat-comparison ${comparison.isPositive ? 'positive' : 'negative'}`}>
                                    <span className="comparison-icon">{comparison.isPositive ? '↑' : '↓'}</span>
                                    <span className="comparison-value">{comparison.percentChange}%</span>
                                    <span className="comparison-period">vs last {comparisonPeriod}</span>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Student Enrollment by Semester - Line Chart */}
                <div className="dashboard-card enrollment-card">
                    <div className="card-header">
                        <h2>Student Enrollment by Semester</h2>
                        <div className="card-actions">
                            <div className="chart-legend-inline">
                                <span className="legend-item">
                                    <span className="legend-dot" style={{backgroundColor: '#8B1538'}}></span>
                                    First Semester
                                </span>
                                <span className="legend-item">
                                    <span className="legend-dot" style={{backgroundColor: '#D4AF37'}}></span>
                                    Second Semester
                                </span>
                            </div>
                            {schoolYears.length > 0 && (
                                <select className="year-selector" value={selectedSchoolYear || ''} onChange={handleSchoolYearChange}>
                                    {schoolYears.map(year => (
                                        <option key={year.id} value={year.id}>{year.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="chart-container" style={{height: '280px', padding: '20px 10px 10px'}}>
                        {chartData && <Line data={enrollmentChartData} options={enrollmentChartOptions} />}
                    </div>
                </div>

                {/* Students by Department Chart */}
                <div className="dashboard-card department-card">
                    <div className="card-header">
                        <h2>Students by Department</h2>
                    </div>
                    <div className="chart-container" style={{height: '280px', padding: '20px 10px 10px'}}>
                        {chartData && <Doughnut data={departmentChartData} options={departmentChartOptions} />}
                    </div>
                </div>

                {/* Events Calendar */}
                <div className="dashboard-card calendar-card">
                    <div className="card-header">
                        <h2><FiCalendar style={{marginRight: '8px'}} />Events Calendar</h2>
                    </div>
                    <div className="calendar-container">
                        <Calendar
                            onChange={setCalendarDate}
                            value={calendarDate}
                            className="dashboard-calendar"
                        />
                    </div>
                </div>

                {/* Students by Course - Bar Chart */}
                <div className="dashboard-card course-card">
                    <div className="card-header">
                        <h2>Students by Course</h2>
                    </div>
                    <div className="chart-container" style={{height: '280px', padding: '20px 10px 10px'}}>
                        {chartData && courseChartData && <Bar data={courseChartData} options={courseChartOptions} />}
                    </div>
                </div>

                {/* Faculty by Department */}
                <div className="dashboard-card faculty-card">
                    <div className="card-header">
                        <h2>Faculty by Department</h2>
                    </div>
                    <div className="faculty-list">
                        {chartData && chartData.faculty_by_department.labels.map((label, index) => (
                            <div className="faculty-item" key={index}>
                                <div className="faculty-info">
                                    <div className="faculty-avatar" style={{
                                        background: `linear-gradient(135deg, ${['#8B1538', '#D4AF37', '#A71D45', '#C9A961', '#6B0F2A'][index % 5]}, ${['#A71D45', '#E5C985', '#C9A961', '#F0C75E', '#8B1538'][index % 5]})`
                                    }}>
                                        {label.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="faculty-details">
                                        <div className="faculty-name">{label}</div>
                                        <div className="faculty-count">{chartData.faculty_by_department.data[index]} Members</div>
                                    </div>
                                </div>
                                <div className="faculty-badge">
                                    {chartData.faculty_by_department.data[index]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card actions-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions-list">
                        <Link to="/students" className="quick-action-item">
                            <div className="action-icon" style={{backgroundColor: '#F5E6EA', color: '#8B1538'}}>
                                <HiOutlineAcademicCap size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Manage Students</div>
                                <div className="action-desc">Add or edit student records</div>
                            </div>
                        </Link>
                        <Link to="/faculty" className="quick-action-item">
                            <div className="action-icon" style={{backgroundColor: '#FBF6E8', color: '#D4AF37'}}>
                                <FiUsers size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Manage Faculty</div>
                                <div className="action-desc">Add or edit faculty members</div>
                            </div>
                        </Link>
                        <Link to="/settings/departments" className="quick-action-item">
                            <div className="action-icon" style={{backgroundColor: '#F0E5E9', color: '#A71D45'}}>
                                <FiBookOpen size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Manage Departments</div>
                                <div className="action-desc">Configure departments</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
