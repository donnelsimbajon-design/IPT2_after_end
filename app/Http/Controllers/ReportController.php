<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Student;
use App\Models\Faculty;

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
                    $query = Student::query();
                    if (isset($parameters['status'])) {
                        $query->where('status', $parameters['status']);
                    }
                    if (isset($parameters['program'])) {
                        $query->where('program', $parameters['program']);
                    }
                    $data = $query->get();
                    break;
                
                case 'faculty':
                    $query = Faculty::query();
                    if (isset($parameters['department'])) {
                        $query->where('department', $parameters['department']);
                    }
                    if (isset($parameters['status'])) {
                        $query->where('status', $parameters['status']);
                    }
                    $data = $query->get();
                    break;
                
                case 'enrollment':
                    $data = Student::selectRaw('program, year_level, count(*) as count')
                        ->groupBy('program', 'year_level')
                        ->get();
                    break;
                
                default:
                    return response()->json(['message' => 'Invalid report type'], 400);
            }

            // Save report record
            $report = Report::create([
                'report_name' => $request->input('report_name', ucfirst($type) . ' Report'),
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
     * Display the specified report
     */
    public function show($id)
    {
        $report = Report::with('generatedBy')->findOrFail($id);
        return response()->json($report);
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
}
