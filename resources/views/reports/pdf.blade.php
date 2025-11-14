<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            color: #333;
            line-height: 1.4;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563eb;
        }
        
        .header h1 {
            color: #1e40af;
            font-size: 20pt;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            color: #64748b;
            font-size: 10pt;
        }
        
        .info-section {
            margin-bottom: 20px;
            background-color: #f8fafc;
            padding: 10px;
            border-radius: 5px;
        }
        
        .info-section p {
            margin: 3px 0;
            font-size: 9pt;
        }
        
        .info-section strong {
            color: #1e40af;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 9pt;
        }
        
        table thead {
            background-color: #2563eb;
            color: white;
        }
        
        table thead th {
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            font-size: 9pt;
        }
        
        table tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        table tbody td {
            padding: 6px 6px;
            font-size: 8.5pt;
        }
        
        .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            border-radius: 5px;
        }
        
        .summary h3 {
            color: #1e40af;
            font-size: 12pt;
            margin-bottom: 8px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .summary-item {
            background-color: white;
            padding: 8px;
            border-radius: 4px;
        }
        
        .summary-item .label {
            color: #64748b;
            font-size: 8pt;
            margin-bottom: 2px;
        }
        
        .summary-item .value {
            color: #1e40af;
            font-size: 14pt;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 8pt;
            color: #64748b;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <div class="subtitle">Generated Report</div>
    </div>

    <div class="info-section">
        <p><strong>Generated At:</strong> {{ $generated_at }}</p>
        @if(isset($parameters) && count($parameters) > 0)
            <p><strong>Filters Applied:</strong></p>
            @foreach($parameters as $key => $value)
                @if($value)
                    <p style="margin-left: 15px;">• {{ ucwords(str_replace('_', ' ', $key)) }}: {{ $value }}</p>
                @endif
            @endforeach
        @endif
    </div>

    @if($type === 'students')
        @if(count($data) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Year Level</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data as $student)
                        <tr>
                            <td>{{ $student->student_id }}</td>
                            <td>{{ $student->first_name }} {{ $student->last_name }}</td>
                            <td>{{ $student->email }}</td>
                            <td>{{ $student->course ?? 'N/A' }}</td>
                            <td>{{ $student->year_level ?? 'N/A' }}</td>
                            <td>{{ $student->status ?? 'Active' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="summary">
                <h3>Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="label">Total Students</div>
                        <div class="value">{{ count($data) }}</div>
                    </div>
                    @php
                        $activeCount = collect($data)->where('status', 'Active')->count();
                    @endphp
                    <div class="summary-item">
                        <div class="label">Active Students</div>
                        <div class="value">{{ $activeCount }}</div>
                    </div>
                </div>
            </div>
        @else
            <div class="no-data">
                <p>No student records found matching the selected filters.</p>
            </div>
        @endif

    @elseif($type === 'faculty')
        @if(count($data) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Faculty ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data as $faculty)
                        <tr>
                            <td>{{ $faculty->faculty_id }}</td>
                            <td>{{ $faculty->first_name }} {{ $faculty->last_name }}</td>
                            <td>{{ $faculty->email }}</td>
                            <td>{{ $faculty->department ?? 'N/A' }}</td>
                            <td>{{ $faculty->position ?? 'N/A' }}</td>
                            <td>{{ $faculty->status ?? 'Active' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="summary">
                <h3>Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="label">Total Faculty</div>
                        <div class="value">{{ count($data) }}</div>
                    </div>
                    @php
                        $activeCount = collect($data)->where('status', 'Active')->count();
                    @endphp
                    <div class="summary-item">
                        <div class="label">Active Faculty</div>
                        <div class="value">{{ $activeCount }}</div>
                    </div>
                </div>
            </div>
        @else
            <div class="no-data">
                <p>No faculty records found matching the selected filters.</p>
            </div>
        @endif
    @endif

    <div class="footer">
        <p>This is an automatically generated report from the Student Information System.</p>
        <p>© {{ date('Y') }} All Rights Reserved</p>
    </div>
</body>
</html>
