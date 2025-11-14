# Testing the Report Module

## Test the API Endpoints

### 1. Get Filter Options
```bash
curl -X GET http://localhost:8000/api/reports/filter-options \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### 2. Get Courses
```bash
curl -X GET http://localhost:8000/api/reports/courses \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### 3. Get Departments
```bash
curl -X GET http://localhost:8000/api/reports/departments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### 4. Generate Students by Course Report
```bash
curl -X POST http://localhost:8000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "report_type": "students_by_course",
    "report_name": "BSCS Students Report",
    "description": "List of all BSCS students",
    "parameters": {
      "course": "BSCS",
      "year_level": "3rd Year",
      "status": "Active"
    }
  }'
```

### 5. Generate Faculty by Department Report
```bash
curl -X POST http://localhost:8000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "report_type": "faculty_by_department",
    "report_name": "CCS Faculty Report",
    "description": "Faculty members in Computer Studies",
    "parameters": {
      "department": "College of Computer Studies",
      "status": "Active"
    }
  }'
```

### 6. Get All Reports
```bash
curl -X GET http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### 7. Get Report Statistics
```bash
curl -X GET http://localhost:8000/api/reports/statistics \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

## PowerShell Testing (Windows)

### Get Filter Options
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/reports/filter-options" `
  -Method GET `
  -Headers @{"Accept"="application/json"}
```

### Generate Students by Course Report
```powershell
$body = @{
    report_type = "students_by_course"
    report_name = "BSCS Students Report"
    description = "List of all BSCS students"
    parameters = @{
        course = "BSCS"
        year_level = "3rd Year"
        status = "Active"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/reports/generate" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"; "Accept"="application/json"} `
  -Body $body
```

### Generate Faculty by Department Report
```powershell
$body = @{
    report_type = "faculty_by_department"
    report_name = "CCS Faculty Report"
    description = "Faculty members in Computer Studies"
    parameters = @{
        department = "College of Computer Studies"
        status = "Active"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/reports/generate" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"; "Accept"="application/json"} `
  -Body $body
```

## Sample Frontend Implementation (Vue.js/React)

### Vue.js Component Example
```vue
<template>
  <div class="report-generator">
    <h2>Generate Reports</h2>
    
    <div class="form-group">
      <label>Report Type:</label>
      <select v-model="reportType">
        <option value="students_by_course">Students by Course</option>
        <option value="faculty_by_department">Faculty by Department</option>
        <option value="enrollment_summary">Enrollment Summary</option>
      </select>
    </div>

    <!-- Students by Course Filters -->
    <div v-if="reportType === 'students_by_course'">
      <div class="form-group">
        <label>Course:</label>
        <select v-model="filters.course">
          <option v-for="course in filterOptions.courses" :key="course" :value="course">
            {{ course }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Year Level:</label>
        <select v-model="filters.year_level">
          <option value="">All Year Levels</option>
          <option v-for="year in filterOptions.year_levels" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Faculty by Department Filters -->
    <div v-if="reportType === 'faculty_by_department'">
      <div class="form-group">
        <label>Department:</label>
        <select v-model="filters.department">
          <option v-for="dept in filterOptions.departments" :key="dept.id" :value="dept.name">
            {{ dept.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Position:</label>
        <select v-model="filters.position">
          <option value="">All Positions</option>
          <option v-for="pos in filterOptions.positions" :key="pos" :value="pos">
            {{ pos }}
          </option>
        </select>
      </div>
    </div>

    <button @click="generateReport">Generate Report</button>

    <!-- Display Results -->
    <div v-if="reportData" class="report-results">
      <h3>{{ reportData.report.report_name }}</h3>
      
      <!-- Summary Statistics -->
      <div v-if="reportData.data.summary" class="summary">
        <h4>Summary</h4>
        <p>Total: {{ reportData.data.summary.total_students || reportData.data.summary.total_faculty }}</p>
        <!-- More summary data... -->
      </div>

      <!-- Data Table -->
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.student_id || item.faculty_id }}</td>
            <td>{{ item.first_name }} {{ item.last_name }}</td>
            <td>{{ item.course || item.department }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reportType: 'students_by_course',
      filters: {
        course: '',
        department: '',
        year_level: '',
        position: '',
        status: 'Active'
      },
      filterOptions: {
        courses: [],
        departments: [],
        year_levels: [],
        positions: []
      },
      reportData: null
    }
  },
  mounted() {
    this.loadFilterOptions();
  },
  computed: {
    columns() {
      if (this.reportType.includes('student')) {
        return ['Student ID', 'Name', 'Course', 'Status'];
      }
      return ['Faculty ID', 'Name', 'Department', 'Status'];
    },
    items() {
      if (!this.reportData?.data) return [];
      return this.reportData.data.students || this.reportData.data.faculty || [];
    }
  },
  methods: {
    async loadFilterOptions() {
      try {
        const response = await axios.get('/api/reports/filter-options');
        this.filterOptions = response.data;
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    },
    async generateReport() {
      try {
        const response = await axios.post('/api/reports/generate', {
          report_type: this.reportType,
          report_name: this.getReportName(),
          parameters: this.getActiveFilters()
        });
        
        this.reportData = response.data;
        console.log('Report generated:', this.reportData);
      } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report');
      }
    },
    getReportName() {
      if (this.reportType === 'students_by_course') {
        return `${this.filters.course} Students Report`;
      }
      if (this.reportType === 'faculty_by_department') {
        return `${this.filters.department} Faculty Report`;
      }
      return 'Report';
    },
    getActiveFilters() {
      const active = {};
      for (const [key, value] of Object.entries(this.filters)) {
        if (value) active[key] = value;
      }
      return active;
    }
  }
}
</script>
```

## Expected Response Format

### Students by Course Report Response
```json
{
  "report": {
    "id": 1,
    "report_name": "BSCS Students Report",
    "report_type": "students_by_course",
    "description": "List of all BSCS students",
    "parameters": {
      "course": "BSCS",
      "year_level": "3rd Year",
      "status": "Active"
    },
    "generated_by": 1,
    "generated_at": "2025-10-27T10:30:00.000000Z",
    "status": "Generated"
  },
  "data": {
    "students": [...],
    "summary": {
      "total_students": 45,
      "course": "BSCS",
      "by_year_level": {...},
      "by_gender": {...},
      "by_status": {...}
    }
  },
  "message": "Report generated successfully"
}
```

### Faculty by Department Report Response
```json
{
  "report": {
    "id": 2,
    "report_name": "CCS Faculty Report",
    "report_type": "faculty_by_department",
    "description": "Faculty members in Computer Studies",
    "parameters": {
      "department": "College of Computer Studies",
      "status": "Active"
    },
    "generated_by": 1,
    "generated_at": "2025-10-27T10:35:00.000000Z",
    "status": "Generated"
  },
  "data": {
    "faculty": [...],
    "summary": {
      "total_faculty": 25,
      "department": "College of Computer Studies",
      "by_position": {...},
      "by_employment_type": {...},
      "by_gender": {...},
      "by_status": {...}
    }
  },
  "message": "Report generated successfully"
}
```
