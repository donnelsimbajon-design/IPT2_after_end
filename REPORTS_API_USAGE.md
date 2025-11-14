# Reports API Usage Guide

## Overview
The Reports module allows you to generate various types of reports with flexible filtering options.

## Available Report Types

### 1. Students Report (`students`)
General student report with various filters.

### 2. Students by Course Report (`students_by_course`)
Filtered report showing students enrolled in a specific course.

### 3. Faculty Report (`faculty`)
General faculty report with various filters.

### 4. Faculty by Department Report (`faculty_by_department`)
Filtered report showing faculty members in a specific department.

### 5. Enrollment Report (`enrollment`)
Statistical report on enrollment numbers.

### 6. Enrollment Summary Report (`enrollment_summary`)
Comprehensive enrollment statistics.

---

## API Endpoints

### Get Filter Options
**GET** `/api/reports/filter-options`

Returns all available filter options for generating reports.

**Response:**
```json
{
  "courses": ["BSCS", "BSIT", "BSIS"],
  "departments": [
    {"id": 1, "code": "CCS", "name": "College of Computer Studies"},
    {"id": 2, "code": "COED", "name": "College of Education"}
  ],
  "programs": ["BS Computer Science", "BS Information Technology"],
  "year_levels": ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
  "student_statuses": ["Active", "Inactive", "Graduated"],
  "faculty_statuses": ["Active", "On Leave", "Resigned"],
  "positions": ["Professor", "Associate Professor", "Assistant Professor"],
  "employment_types": ["Full-time", "Part-time", "Contractual"]
}
```

### Get Courses
**GET** `/api/reports/courses`

Returns all active courses with department information.

### Get Departments
**GET** `/api/reports/departments`

Returns all active departments.

### Get Statistics
**GET** `/api/reports/statistics`

Returns report generation statistics.

### Generate Report
**POST** `/api/reports/generate`

Generate a new report based on type and parameters.

**Request Body Examples:**

#### 1. Students by Course Report
```json
{
  "report_type": "students_by_course",
  "report_name": "BSCS Students Report",
  "description": "List of all BSCS students",
  "parameters": {
    "course": "BSCS",
    "year_level": "3rd Year",
    "status": "Active"
  }
}
```

**Response:**
```json
{
  "report": {
    "id": 1,
    "report_name": "BSCS Students Report",
    "report_type": "students_by_course",
    "generated_at": "2025-10-27T10:30:00",
    "generated_by": 1
  },
  "data": {
    "students": [
      {
        "id": 1,
        "student_id": "2021-00001",
        "first_name": "John",
        "last_name": "Doe",
        "course": "BSCS",
        "year_level": "3rd Year",
        "status": "Active"
      }
    ],
    "summary": {
      "total_students": 45,
      "course": "BSCS",
      "by_year_level": {
        "1st Year": 15,
        "2nd Year": 12,
        "3rd Year": 10,
        "4th Year": 8
      },
      "by_gender": {
        "Male": 30,
        "Female": 15
      },
      "by_status": {
        "Active": 42,
        "Inactive": 3
      }
    }
  },
  "message": "Report generated successfully"
}
```

#### 2. Faculty by Department Report
```json
{
  "report_type": "faculty_by_department",
  "report_name": "CCS Faculty Report",
  "description": "List of all faculty members in Computer Studies",
  "parameters": {
    "department": "College of Computer Studies",
    "status": "Active",
    "employment_type": "Full-time"
  }
}
```

**Response:**
```json
{
  "report": {
    "id": 2,
    "report_name": "CCS Faculty Report",
    "report_type": "faculty_by_department",
    "generated_at": "2025-10-27T10:35:00",
    "generated_by": 1
  },
  "data": {
    "faculty": [
      {
        "id": 1,
        "faculty_id": "FAC-001",
        "first_name": "Jane",
        "last_name": "Smith",
        "department": "College of Computer Studies",
        "position": "Professor",
        "employment_type": "Full-time",
        "status": "Active"
      }
    ],
    "summary": {
      "total_faculty": 25,
      "department": "College of Computer Studies",
      "by_position": {
        "Professor": 5,
        "Associate Professor": 8,
        "Assistant Professor": 12
      },
      "by_employment_type": {
        "Full-time": 20,
        "Part-time": 5
      },
      "by_gender": {
        "Male": 15,
        "Female": 10
      },
      "by_status": {
        "Active": 23,
        "On Leave": 2
      }
    }
  },
  "message": "Report generated successfully"
}
```

#### 3. General Students Report
```json
{
  "report_type": "students",
  "report_name": "All Active Students",
  "parameters": {
    "status": "Active",
    "program": "BS Computer Science",
    "year_level": "4th Year"
  }
}
```

#### 4. General Faculty Report
```json
{
  "report_type": "faculty",
  "report_name": "All Full-time Faculty",
  "parameters": {
    "employment_type": "Full-time",
    "status": "Active"
  }
}
```

#### 5. Enrollment Summary
```json
{
  "report_type": "enrollment_summary",
  "report_name": "Total Enrollment Summary",
  "parameters": {
    "status": "Active"
  }
}
```

**Response:**
```json
{
  "report": {...},
  "data": {
    "total_students": 1250,
    "by_program": {
      "BS Computer Science": 450,
      "BS Information Technology": 380,
      "BS Information Systems": 420
    },
    "by_year_level": {
      "1st Year": 400,
      "2nd Year": 350,
      "3rd Year": 300,
      "4th Year": 200
    },
    "by_department": {
      "College of Computer Studies": 750,
      "College of Education": 500
    },
    "by_status": {
      "Active": 1200,
      "Inactive": 50
    },
    "by_gender": {
      "Male": 700,
      "Female": 550
    }
  },
  "message": "Report generated successfully"
}
```

### List All Reports
**GET** `/api/reports`

Returns all generated reports with pagination.

### Get Single Report
**GET** `/api/reports/{id}`

Returns a specific report by ID.

### Delete Report
**DELETE** `/api/reports/{id}`

Deletes a specific report.

---

## Available Filter Parameters

### Students Reports
- `course` - Course code (e.g., "BSCS")
- `program` - Full program name
- `year_level` - Year level ("1st Year", "2nd Year", etc.)
- `status` - Student status ("Active", "Inactive", etc.)
- `department` - Department name
- `gender` - Gender ("Male", "Female")
- `section` - Section name

### Faculty Reports
- `department` - Department name
- `position` - Faculty position
- `employment_type` - Employment type ("Full-time", "Part-time", etc.)
- `status` - Faculty status ("Active", "On Leave", etc.)
- `gender` - Gender ("Male", "Female")

---

## Usage Examples (JavaScript/Axios)

### Generate Students by Course Report
```javascript
const generateStudentsByCourse = async (course, yearLevel) => {
  try {
    const response = await axios.post('/api/reports/generate', {
      report_type: 'students_by_course',
      report_name: `${course} - ${yearLevel} Students`,
      description: `Report of ${yearLevel} students in ${course}`,
      parameters: {
        course: course,
        year_level: yearLevel,
        status: 'Active'
      }
    });
    
    console.log('Report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

// Usage
generateStudentsByCourse('BSCS', '3rd Year');
```

### Generate Faculty by Department Report
```javascript
const generateFacultyByDepartment = async (department) => {
  try {
    const response = await axios.post('/api/reports/generate', {
      report_type: 'faculty_by_department',
      report_name: `${department} Faculty Report`,
      description: `Complete faculty list for ${department}`,
      parameters: {
        department: department,
        status: 'Active'
      }
    });
    
    console.log('Report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

// Usage
generateFacultyByDepartment('College of Computer Studies');
```

### Get Filter Options
```javascript
const getFilterOptions = async () => {
  try {
    const response = await axios.get('/api/reports/filter-options');
    console.log('Filter options:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching filter options:', error);
  }
};
```

---

## Notes

1. All requests require authentication (auth:web middleware)
2. The `generated_by` field is automatically set to the authenticated user
3. All filters are optional - you can generate reports without any filters
4. Summary statistics are automatically included for course-based and department-based reports
5. Reports are saved in the database with all parameters for future reference
6. Use the filter options endpoint to populate dropdown menus in your UI
