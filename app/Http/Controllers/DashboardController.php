<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Report;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index()
    {
        $stats = [
            'total_students' => Student::count(),
            'active_students' => Student::where('status', 'Active')->count(),
            'total_faculty' => Faculty::count(),
            'active_faculty' => Faculty::where('status', 'Active')->count(),
            'total_reports' => Report::count(),
            'recent_students' => Student::orderBy('created_at', 'desc')->take(5)->get(),
            'recent_faculty' => Faculty::orderBy('created_at', 'desc')->take(5)->get(),
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
}
