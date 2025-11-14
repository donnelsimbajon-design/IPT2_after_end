<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Report;
use App\Models\Department;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        $period = $request->query('period', 'day'); // day, month, year
        
        // Current counts
        $totalStudents = Student::count();
        $totalFaculty = Faculty::count();
        $totalDepartments = Department::count();
        // Active semesters: those where current date is between start_date and end_date
        $activeSemesters = Semester::whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->count();
        // If no active semesters by date, just count all semesters
        if ($activeSemesters == 0) {
            $activeSemesters = Semester::count();
        }

        // For comparison: count records created in the current period
        $now = now();
        switch ($period) {
            case 'month':
                $periodStart = $now->copy()->startOfMonth();
                $previousPeriodStart = $now->copy()->subMonth()->startOfMonth();
                $previousPeriodEnd = $now->copy()->subMonth()->endOfMonth();
                break;
            case 'year':
                $periodStart = $now->copy()->startOfYear();
                $previousPeriodStart = $now->copy()->subYear()->startOfYear();
                $previousPeriodEnd = $now->copy()->subYear()->endOfYear();
                break;
            case 'day':
            default:
                $periodStart = $now->copy()->startOfDay();
                $previousPeriodStart = $now->copy()->subDay()->startOfDay();
                $previousPeriodEnd = $now->copy()->subDay()->endOfDay();
                break;
        }

        // Count new records in current period
        $currentPeriodStudents = Student::where('created_at', '>=', $periodStart)->count();
        $currentPeriodFaculty = Faculty::where('created_at', '>=', $periodStart)->count();
        $currentPeriodDepartments = Department::where('created_at', '>=', $periodStart)->count();

        // Count new records in previous period
        $previousPeriodStudents = Student::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->count();
        $previousPeriodFaculty = Faculty::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->count();
        $previousPeriodDepartments = Department::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->count();

        // Calculate percentage change
        $studentsChange = $currentPeriodStudents - $previousPeriodStudents;
        $studentsPercent = $previousPeriodStudents > 0 
            ? round(($studentsChange / $previousPeriodStudents) * 100, 1) 
            : ($currentPeriodStudents > 0 ? 100 : 0);

        $facultyChange = $currentPeriodFaculty - $previousPeriodFaculty;
        $facultyPercent = $previousPeriodFaculty > 0 
            ? round(($facultyChange / $previousPeriodFaculty) * 100, 1) 
            : ($currentPeriodFaculty > 0 ? 100 : 0);

        $departmentsChange = $currentPeriodDepartments - $previousPeriodDepartments;
        $departmentsPercent = $previousPeriodDepartments > 0 
            ? round(($departmentsChange / $previousPeriodDepartments) * 100, 1) 
            : ($currentPeriodDepartments > 0 ? 100 : 0);

        $stats = [
            'total_students' => $totalStudents,
            'active_students' => Student::where('status', 'Active')->count(),
            'total_faculty' => $totalFaculty,
            'active_faculty' => Faculty::where('status', 'Active')->count(),
            'total_departments' => $totalDepartments,
            'active_semesters' => $activeSemesters,
            'total_reports' => Report::count(),
            'recent_students' => Student::orderBy('created_at', 'desc')->take(5)->get(),
            'recent_faculty' => Faculty::orderBy('created_at', 'desc')->take(5)->get(),
            
            // Comparison data (based on NEW records in period)
            'comparison' => [
                'students' => [
                    'current' => $currentPeriodStudents,
                    'previous' => $previousPeriodStudents,
                    'change' => $studentsChange,
                    'percent' => $studentsPercent,
                ],
                'faculty' => [
                    'current' => $currentPeriodFaculty,
                    'previous' => $previousPeriodFaculty,
                    'change' => $facultyChange,
                    'percent' => $facultyPercent,
                ],
                'departments' => [
                    'current' => $currentPeriodDepartments,
                    'previous' => $previousPeriodDepartments,
                    'change' => $departmentsChange,
                    'percent' => $departmentsPercent,
                ],
                'semesters' => [
                    'current' => $activeSemesters,
                    'previous' => $activeSemesters,
                    'change' => 0,
                    'percent' => 0,
                ],
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Get statistics by category
     */
    public function statistics(Request $request)
    {
        $type = $request->query('type', 'overview');

        switch ($type) {
            case 'students':
                return response()->json([
                    'total' => Student::count(),
                    'by_status' => Student::selectRaw('status, count(*) as count')
                        ->groupBy('status')
                        ->get(),
                    'by_year_level' => Student::selectRaw('year_level, count(*) as count')
                        ->groupBy('year_level')
                        ->get(),
                ]);
            
            case 'faculty':
                return response()->json([
                    'total' => Faculty::count(),
                    'by_department' => Faculty::selectRaw('department, count(*) as count')
                        ->groupBy('department')
                        ->get(),
                    'by_employment_type' => Faculty::selectRaw('employment_type, count(*) as count')
                        ->groupBy('employment_type')
                        ->get(),
                ]);
            
            default:
                return $this->index();
        }
    }

    /**
     * Get chart data for dashboard
     */
    public function chartData(Request $request)
    {
        try {
            $schoolYearId = $request->query('school_year_id');
            
            // Get all school years for the dropdown
            $schoolYears = DB::table('school_years')
                ->select('id', 'label')
                ->orderBy('id', 'desc')
                ->get();

            // If no school year selected, use the most recent one
            if (!$schoolYearId && $schoolYears->count() > 0) {
                $schoolYearId = $schoolYears->first()->id;
            }

            // Line Chart: Students added per day in selected school year (First & Second Semester)
            $firstSemesterData = [];
            $secondSemesterData = [];
            $dateLabels = [];
            
            try {
                if ($schoolYearId) {
                    // Get students by date for first semester
                    $firstSemester = DB::table('semesters')
                        ->where('school_year_id', $schoolYearId)
                        ->where('name', '1st Semester')
                        ->first();
                    
                    // Get students by date for second semester
                    $secondSemester = DB::table('semesters')
                        ->where('school_year_id', $schoolYearId)
                        ->where('name', '2nd Semester')
                        ->first();
                    
                    if ($firstSemester || $secondSemester) {
                        // Get all unique dates when students were added
                        $allDates = DB::table('students')
                            ->whereIn('semester_id', array_filter([$firstSemester->id ?? null, $secondSemester->id ?? null]))
                            ->select(DB::raw('DATE(created_at) as date'))
                            ->distinct()
                            ->orderBy('date')
                            ->pluck('date');
                        
                        foreach ($allDates as $date) {
                            $dateLabels[] = date('M d', strtotime($date));
                            
                            // Count students added on this date for first semester
                            if ($firstSemester) {
                                $count = DB::table('students')
                                    ->where('semester_id', $firstSemester->id)
                                    ->whereDate('created_at', $date)
                                    ->count();
                                $firstSemesterData[] = $count;
                            } else {
                                $firstSemesterData[] = 0;
                            }
                            
                            // Count students added on this date for second semester
                            if ($secondSemester) {
                                $count = DB::table('students')
                                    ->where('semester_id', $secondSemester->id)
                                    ->whereDate('created_at', $date)
                                    ->count();
                                $secondSemesterData[] = $count;
                            } else {
                                $secondSemesterData[] = 0;
                            }
                        }
                    }
                }
                
                // If no data, show placeholder
                if (empty($dateLabels)) {
                    $dateLabels = ['No Data'];
                    $firstSemesterData = [0];
                    $secondSemesterData = [0];
                }
            } catch (\Exception $e) {
                \Log::error('Semester data error: ' . $e->getMessage());
                $dateLabels = ['No Data'];
                $firstSemesterData = [0];
                $secondSemesterData = [0];
            }

            // Pie Chart: Students by Department (for selected school year)
            $studentDeptLabels = [];
            $studentDeptData = [];
            
            try {
                $query = DB::table('students')
                    ->select(
                        'students.department as department_name',
                        DB::raw('COUNT(students.id) as count')
                    )
                    ->whereNotNull('students.department')
                    ->where('students.department', '!=', '');
                
                if ($schoolYearId) {
                    // Use LEFT JOIN to include students without semester_id
                    $query->leftJoin('semesters', 'students.semester_id', '=', 'semesters.id')
                          ->where(function($q) use ($schoolYearId) {
                              $q->where('semesters.school_year_id', $schoolYearId)
                                ->orWhereNull('students.semester_id');
                          });
                }
                
                $studentsByDepartment = $query
                    ->groupBy('students.department')
                    ->orderBy('count', 'desc')
                    ->get();

                if ($studentsByDepartment->count() > 0) {
                    $studentDeptLabels = $studentsByDepartment->pluck('department_name')->toArray();
                    $studentDeptData = $studentsByDepartment->pluck('count')->toArray();
                } else {
                    $studentDeptLabels = ['No Data'];
                    $studentDeptData = [0];
                }
            } catch (\Exception $e) {
                \Log::error('Students by department error: ' . $e->getMessage());
                $studentDeptLabels = ['No Data'];
                $studentDeptData = [0];
            }

            // Bar Chart: Faculty count by Department
            $facultyDeptLabels = [];
            $facultyDeptData = [];
            
            try {
                $facultyByDepartment = DB::table('faculties')
                    ->select(
                        'faculties.department as department_name',
                        DB::raw('COUNT(faculties.id) as count')
                    )
                    ->whereNotNull('faculties.department')
                    ->where('faculties.department', '!=', '')
                    ->groupBy('faculties.department')
                    ->orderBy('count', 'desc')
                    ->get();

                if ($facultyByDepartment->count() > 0) {
                    $facultyDeptLabels = $facultyByDepartment->pluck('department_name')->toArray();
                    $facultyDeptData = $facultyByDepartment->pluck('count')->toArray();
                } else {
                    $facultyDeptLabels = ['No Data'];
                    $facultyDeptData = [0];
                }
            } catch (\Exception $e) {
                \Log::error('Faculty by department error: ' . $e->getMessage());
                $facultyDeptLabels = ['No Data'];
                $facultyDeptData = [0];
            }

            // Pie Chart: Students by Course (for selected school year)
            $studentCourseLabels = [];
            $studentCourseData = [];
            
            try {
                $query = DB::table('students')
                    ->select(
                        'students.course as course_name',
                        DB::raw('COUNT(students.id) as count')
                    )
                    ->whereNotNull('students.course')
                    ->where('students.course', '!=', '');
                
                if ($schoolYearId) {
                    $query->leftJoin('semesters', 'students.semester_id', '=', 'semesters.id')
                          ->where(function($q) use ($schoolYearId) {
                              $q->where('semesters.school_year_id', $schoolYearId)
                                ->orWhereNull('students.semester_id');
                          });
                }
                
                $studentsByCourse = $query
                    ->groupBy('students.course')
                    ->orderBy('count', 'desc')
                    ->get();

                if ($studentsByCourse->count() > 0) {
                    $studentCourseLabels = $studentsByCourse->pluck('course_name')->toArray();
                    $studentCourseData = $studentsByCourse->pluck('count')->toArray();
                } else {
                    $studentCourseLabels = ['No Data'];
                    $studentCourseData = [0];
                }
            } catch (\Exception $e) {
                \Log::error('Students by course error: ' . $e->getMessage());
                $studentCourseLabels = ['No Data'];
                $studentCourseData = [0];
            }

            // Bar Chart: Students Enrollment by Semester (for selected school year)
            $enrollmentSemesterLabels = [];
            $enrollmentSemesterData = [];
            
            try {
                $query = DB::table('students')
                    ->join('semesters', 'students.semester_id', '=', 'semesters.id')
                    ->select(
                        'semesters.name as semester_name',
                        DB::raw('COUNT(students.id) as count')
                    )
                    ->whereNotNull('semesters.name');
                
                if ($schoolYearId) {
                    $query->where('semesters.school_year_id', $schoolYearId);
                }
                
                $studentsBySemester = $query
                    ->groupBy('semesters.name')
                    ->orderBy('semesters.name')
                    ->get();

                if ($studentsBySemester->count() > 0) {
                    $enrollmentSemesterLabels = $studentsBySemester->pluck('semester_name')->toArray();
                    $enrollmentSemesterData = $studentsBySemester->pluck('count')->toArray();
                } else {
                    $enrollmentSemesterLabels = ['No Data'];
                    $enrollmentSemesterData = [0];
                }
            } catch (\Exception $e) {
                \Log::error('Students by semester error: ' . $e->getMessage());
                $enrollmentSemesterLabels = ['No Data'];
                $enrollmentSemesterData = [0];
            }

            return response()->json([
                'school_years' => $schoolYears,
                'selected_school_year_id' => $schoolYearId,
                'students_by_day' => [
                    'labels' => $dateLabels,
                    'first_semester' => $firstSemesterData,
                    'second_semester' => $secondSemesterData,
                ],
                'students_by_department' => [
                    'labels' => $studentDeptLabels,
                    'data' => $studentDeptData,
                ],
                'students_by_course' => [
                    'labels' => $studentCourseLabels,
                    'data' => $studentCourseData,
                ],
                'students_by_semester' => [
                    'labels' => $enrollmentSemesterLabels,
                    'data' => $enrollmentSemesterData,
                ],
                'faculty_by_department' => [
                    'labels' => $facultyDeptLabels,
                    'data' => $facultyDeptData,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard chart data error: ' . $e->getMessage());
            
            // Return empty/default data structure
            return response()->json([
                'school_years' => [],
                'selected_school_year_id' => null,
                'students_by_day' => [
                    'labels' => ['No Data'],
                    'first_semester' => [0],
                    'second_semester' => [0],
                ],
                'students_by_department' => [
                    'labels' => ['No Data'],
                    'data' => [0],
                ],
                'students_by_course' => [
                    'labels' => ['No Data'],
                    'data' => [0],
                ],
                'students_by_semester' => [
                    'labels' => ['No Data'],
                    'data' => [0],
                ],
                'faculty_by_department' => [
                    'labels' => ['No Data'],
                    'data' => [0],
                ],
            ]);
        }
    }
}
