<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;

class ReportController extends Controller
{
    /**
     * Display a listing of reports
     */
    public function index()
    {
        $reports = Report::with('generatedBy')->orderBy('created_at', 'desc')->get();
        return response()->json($reports);
    }

    /**
     * Store a newly created report
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'report_name' => 'required|string|max:255',
            'report_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parameters' => 'nullable|array',
        ]);

        $data['generated_by'] = auth()->id();
        $data['generated_at'] = now();
        $data['status'] = 'Generated';

        try {
            $report = Report::create($data);
            return response()->json(['report' => $report, 'message' => 'Report created successfully'], 201);
        } catch (\Throwable $e) {
            \Log::error('Report store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating report',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate a specific report
     */
    public function generate(Request $request)
    {
        $type = $request->input('report_type');
        $parameters = $request->input('parameters', []);

        try {
            $data = [];
            
            switch ($type) {
                case 'students':
                    $data = $this->generateStudentsReport($parameters);
                    break;
                
                case 'students_by_course':
                    $data = $this->generateStudentsByCourseReport($parameters);
                    break;
                
                case 'faculty':
                    $data = $this->generateFacultyReport($parameters);
                    break;
                
                case 'faculty_by_department':
                    $data = $this->generateFacultyByDepartmentReport($parameters);
                    break;
                
                case 'enrollment':
                    $data = $this->generateEnrollmentReport($parameters);
                    break;
                
                case 'enrollment_summary':
                    $data = $this->generateEnrollmentSummary($parameters);
                    break;
                
                default:
                    return response()->json(['message' => 'Invalid report type'], 400);
            }

            // Save report record
            $report = Report::create([
                'report_name' => $request->input('report_name', $this->getReportName($type)),
                'report_type' => $type,
                'description' => $request->input('description'),
                'parameters' => $parameters,
                'generated_by' => auth()->id(),
                'generated_at' => now(),
                'status' => 'Generated',
            ]);

            return response()->json([
                'report' => $report,
                'data' => $data,
                'message' => 'Report generated successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Report generation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error generating report',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate students report with filters
     */
    private function generateStudentsReport($parameters)
    {
        $query = Student::query();

        // Apply filters
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }
        
        if (isset($parameters['program']) && !empty($parameters['program'])) {
            $query->where('program', $parameters['program']);
        }
        
        if (isset($parameters['year_level']) && !empty($parameters['year_level'])) {
            $query->where('year_level', $parameters['year_level']);
        }
        
        if (isset($parameters['department']) && !empty($parameters['department'])) {
            $query->where('department', $parameters['department']);
        }
        
        if (isset($parameters['gender']) && !empty($parameters['gender'])) {
            $query->where('gender', $parameters['gender']);
        }

        return $query->orderBy('last_name')->orderBy('first_name')->get();
    }

    /**
     * Generate students report filtered by course
     */
    private function generateStudentsByCourseReport($parameters)
    {
        $query = Student::query();

        // Course filter is required for this report type
        if (isset($parameters['course']) && !empty($parameters['course'])) {
            $query->where('course', $parameters['course']);
        }

        // Additional optional filters
        if (isset($parameters['year_level']) && !empty($parameters['year_level'])) {
            $query->where('year_level', $parameters['year_level']);
        }
        
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }
        
        if (isset($parameters['section']) && !empty($parameters['section'])) {
            $query->where('section', $parameters['section']);
        }

        $students = $query->orderBy('year_level')
                         ->orderBy('last_name')
                         ->orderBy('first_name')
                         ->get();

        // Add summary statistics
        return [
            'students' => $students,
            'summary' => [
                'total_students' => $students->count(),
                'course' => $parameters['course'] ?? 'All Courses',
                'by_year_level' => $students->groupBy('year_level')->map->count(),
                'by_gender' => $students->groupBy('gender')->map->count(),
                'by_status' => $students->groupBy('status')->map->count(),
            ]
        ];
    }

    /**
     * Generate faculty report with filters
     */
    private function generateFacultyReport($parameters)
    {
        $query = Faculty::query();

        // Apply filters
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }
        
        if (isset($parameters['department']) && !empty($parameters['department'])) {
            $query->where('department', $parameters['department']);
        }
        
        if (isset($parameters['position']) && !empty($parameters['position'])) {
            $query->where('position', $parameters['position']);
        }
        
        if (isset($parameters['employment_type']) && !empty($parameters['employment_type'])) {
            $query->where('employment_type', $parameters['employment_type']);
        }
        
        if (isset($parameters['gender']) && !empty($parameters['gender'])) {
            $query->where('gender', $parameters['gender']);
        }

        return $query->orderBy('last_name')->orderBy('first_name')->get();
    }

    /**
     * Generate faculty report filtered by department
     */
    private function generateFacultyByDepartmentReport($parameters)
    {
        $query = Faculty::query();

        // Department filter is required for this report type
        if (isset($parameters['department']) && !empty($parameters['department'])) {
            $query->where('department', $parameters['department']);
        }

        // Additional optional filters
        if (isset($parameters['position']) && !empty($parameters['position'])) {
            $query->where('position', $parameters['position']);
        }
        
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }
        
        if (isset($parameters['employment_type']) && !empty($parameters['employment_type'])) {
            $query->where('employment_type', $parameters['employment_type']);
        }

        $faculty = $query->orderBy('position')
                        ->orderBy('last_name')
                        ->orderBy('first_name')
                        ->get();

        // Add summary statistics
        return [
            'faculty' => $faculty,
            'summary' => [
                'total_faculty' => $faculty->count(),
                'department' => $parameters['department'] ?? 'All Departments',
                'by_position' => $faculty->groupBy('position')->map->count(),
                'by_employment_type' => $faculty->groupBy('employment_type')->map->count(),
                'by_gender' => $faculty->groupBy('gender')->map->count(),
                'by_status' => $faculty->groupBy('status')->map->count(),
            ]
        ];
    }

    /**
     * Generate enrollment report
     */
    private function generateEnrollmentReport($parameters)
    {
        $query = Student::query();

        if (isset($parameters['program']) && !empty($parameters['program'])) {
            $query->where('program', $parameters['program']);
        }
        
        if (isset($parameters['year_level']) && !empty($parameters['year_level'])) {
            $query->where('year_level', $parameters['year_level']);
        }
        
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }

        return $query->selectRaw('program, year_level, count(*) as count')
                    ->groupBy('program', 'year_level')
                    ->orderBy('program')
                    ->orderBy('year_level')
                    ->get();
    }

    /**
     * Generate enrollment summary report
     */
    private function generateEnrollmentSummary($parameters)
    {
        $query = Student::query();

        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->where('status', $parameters['status']);
        }

        $students = $query->get();

        return [
            'total_students' => $students->count(),
            'by_program' => $students->groupBy('program')->map->count(),
            'by_year_level' => $students->groupBy('year_level')->map->count(),
            'by_department' => $students->groupBy('department')->map->count(),
            'by_status' => $students->groupBy('status')->map->count(),
            'by_gender' => $students->groupBy('gender')->map->count(),
        ];
    }

    /**
     * Get human-readable report name
     */
    private function getReportName($type)
    {
        $names = [
            'students' => 'Students Report',
            'students_by_course' => 'Students by Course Report',
            'faculty' => 'Faculty Report',
            'faculty_by_department' => 'Faculty by Department Report',
            'enrollment' => 'Enrollment Report',
            'enrollment_summary' => 'Enrollment Summary Report',
        ];

        return $names[$type] ?? ucfirst(str_replace('_', ' ', $type)) . ' Report';
    }

    /**
     * Display the specified report
     */
    public function show($id)
    {
        $report = Report::with('generatedBy')->findOrFail($id);
        return response()->json($report);
    }

    /**
     * Download the specified report
     */
    public function download($id)
    {
        $report = Report::findOrFail($id);
        
        // If file path exists, download the file
        if ($report->file_path && file_exists(public_path($report->file_path))) {
            return response()->download(public_path($report->file_path));
        }
        
        // Otherwise generate a PDF on the fly
        try {
            $data = [];
            $title = $report->report_name;
            $filename = str_replace(' ', '_', $report->report_name) . '.pdf';
            
            // Regenerate the report data based on type and parameters
            $parameters = $report->parameters ?? [];
            
            switch ($report->report_type) {
                case 'students_by_course':
                case 'students':
                    $query = Student::query();
                    if (isset($parameters['course'])) $query->where('course', $parameters['course']);
                    if (isset($parameters['year_level'])) $query->where('year_level', $parameters['year_level']);
                    if (isset($parameters['status'])) $query->where('status', $parameters['status']);
                    
                    $data = $query->get();
                    $type = 'students';
                    break;
                    
                case 'faculty_by_department':
                case 'faculty':
                    $query = Faculty::query();
                    if (isset($parameters['department'])) $query->where('department', $parameters['department']);
                    if (isset($parameters['position'])) $query->where('position', $parameters['position']);
                    if (isset($parameters['status'])) $query->where('status', $parameters['status']);
                    
                    $data = $query->get();
                    $type = 'faculty';
                    break;
                    
                default:
                    return response()->json(['message' => 'Cannot download this report type'], 400);
            }
            
            // Generate PDF using DomPDF
            $pdf = \PDF::loadView('reports.pdf', [
                'title' => $title,
                'data' => $data,
                'type' => $type,
                'parameters' => $parameters,
                'generated_at' => now()->format('F d, Y H:i:s')
            ]);
            
            return $pdf->download($filename);
            
        } catch (\Throwable $e) {
            \Log::error('Report download error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error downloading report',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified report
     */
    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $data = $request->validate([
            'report_name' => 'sometimes|nullable|string|max:255',
            'report_type' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'parameters' => 'sometimes|nullable|array',
            'file_path' => 'sometimes|nullable|string',
            'status' => 'sometimes|nullable|in:Generated,Archived',
        ]);

        $report->update($data);
        return response()->json(['report' => $report, 'message' => 'Report updated successfully']);
    }

    /**
     * Remove the specified report
     */
    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        return response()->json(['message' => 'Report deleted successfully'], 200);
    }

    /**
     * Get available filter options for reports
     */
    public function getFilterOptions()
    {
        try {
            return response()->json([
                'courses' => Student::distinct()->pluck('course')->filter()->values(),
                'departments' => Department::where('status', 'active')
                    ->orderBy('name')
                    ->get(['id', 'code', 'name']),
                'programs' => Student::distinct()->pluck('program')->filter()->values(),
                'year_levels' => ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
                'student_statuses' => Student::distinct()->pluck('status')->filter()->values(),
                'faculty_statuses' => Faculty::distinct()->pluck('status')->filter()->values(),
                'positions' => Faculty::distinct()->pluck('position')->filter()->values(),
                'employment_types' => Faculty::distinct()->pluck('employment_type')->filter()->values(),
            ]);
        } catch (\Throwable $e) {
            \Log::error('Filter options error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching filter options',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get available courses
     */
    public function getCourses()
    {
        try {
            $courses = Course::with('department')
                ->where('status', 'active')
                ->orderBy('code')
                ->get();
            
            return response()->json($courses);
        } catch (\Throwable $e) {
            \Log::error('Get courses error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching courses',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get available departments
     */
    public function getDepartments()
    {
        try {
            $departments = Department::where('status', 'active')
                ->orderBy('name')
                ->get();
            
            return response()->json($departments);
        } catch (\Throwable $e) {
            \Log::error('Get departments error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching departments',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get report statistics
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total_reports' => Report::count(),
                'reports_today' => Report::whereDate('created_at', today())->count(),
                'reports_this_week' => Report::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'reports_this_month' => Report::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'by_type' => Report::selectRaw('report_type, count(*) as count')
                    ->groupBy('report_type')
                    ->pluck('count', 'report_type'),
                'recent_reports' => Report::with('generatedBy')
                    ->latest()
                    ->take(5)
                    ->get(),
            ];

            return response()->json($stats);
        } catch (\Throwable $e) {
            \Log::error('Get statistics error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
