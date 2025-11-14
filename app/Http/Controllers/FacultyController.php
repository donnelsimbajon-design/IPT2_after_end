<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculty
     */
    public function index()
    {
        $q = request()->query('q');
        $department = request()->query('department');
        $status = request()->query('status');
        $semesterId = request()->query('semester_id');
        $schoolYearId = request()->query('school_year_id');

        $query = Faculty::query();
        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('first_name', 'like', "%$q%")
                    ->orWhere('last_name', 'like', "%$q%")
                    ->orWhere('faculty_id', 'like', "%$q%")
                    ->orWhere('email', 'like', "%$q%");
            });
        }
        if ($department) { $query->where('department', $department); }
        if ($status) { $query->where('status', $status); }
        if ($semesterId) { $query->where('semester_id', $semesterId); }
        if ($schoolYearId) {
            $query->whereHas('schoolYears', function($sq) use ($schoolYearId) {
                $sq->where('school_years.id', $schoolYearId);
            });
        }

        // Exclude archived by default unless explicitly requested
        if (!$status && !request()->boolean('include_archived')) {
            $query->where('status', '!=', 'Archived');
        }

        $faculties = $query->with(['semester', 'schoolYears'])->orderBy('created_at', 'desc')->get();
        return response()->json($faculties);
    }

    /**
     * Store a newly created faculty
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'faculty_id' => 'nullable|string|unique:faculties,faculty_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:faculties,email',
            'phone' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'employment_type' => 'nullable|in:Full-time,Part-time,Contract',
            'status' => 'nullable|in:Active,Inactive,On Leave,Archived',
            'school_year_id' => 'nullable|exists:school_years,id',
            'semester_id' => 'nullable|exists:semesters,id',
        ]);

        // Defaults similar to Student behavior
        if (empty($data['status'])) {
            $data['status'] = 'Active';
        }
        if (empty($data['hire_date'])) {
            $data['hire_date'] = now()->toDateString();
        }

        // Auto-generate faculty_id if missing (format: FAC-YYYY-XXX)
        if (empty($data['faculty_id'])) {
            $year = date('Y');
            $prefix = 'FAC-' . $year . '-';
            $last = Faculty::where('faculty_id', 'like', $prefix . '%')
                ->orderBy('faculty_id', 'desc')
                ->value('faculty_id');
            $seq = 1;
            if ($last) {
                $n = (int)preg_replace('/^'.preg_quote($prefix, '/').'/', '', $last);
                $seq = $n + 1;
            }
            $data['faculty_id'] = $prefix . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);
        }

        try {
            $schoolYearIdToAttach = $data['school_year_id'] ?? null;
            unset($data['school_year_id']);

            $faculty = Faculty::create($data);

            if ($schoolYearIdToAttach) {
                $faculty->schoolYears()->syncWithoutDetaching([$schoolYearIdToAttach]);
            }

            return response()->json(['faculty' => $faculty, 'message' => 'Faculty created successfully'], 201);
        } catch (\Throwable $e) {
            \Log::error('Faculty store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating faculty',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified faculty
     */
    public function show($id)
    {
        $faculty = Faculty::with(['semester', 'schoolYears'])->findOrFail($id);
        return response()->json($faculty);
    }

    /**
     * Update the specified faculty
     */
    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $data = $request->validate([
            'faculty_id' => 'sometimes|required|string|unique:faculties,faculty_id,' . $id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|required|email|unique:faculties,email,' . $id,
            'phone' => 'sometimes|nullable|string|max:50',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|in:Male,Female,Other',
            'address' => 'sometimes|nullable|string',
            'city' => 'sometimes|nullable|string|max:255',
            'state' => 'sometimes|nullable|string|max:255',
            'zip_code' => 'sometimes|nullable|string|max:50',
            'country' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'specialization' => 'sometimes|nullable|string|max:255',
            'hire_date' => 'sometimes|nullable|date',
            'employment_type' => 'sometimes|nullable|in:Full-time,Part-time,Contract',
            'status' => 'sometimes|nullable|in:Active,Inactive,On Leave,Archived',
            'school_year_id' => 'sometimes|nullable|exists:school_years,id',
            'detach_school_year_id' => 'sometimes|nullable|exists:school_years,id',
            'semester_id' => 'sometimes|nullable|exists:semesters,id',
        ]);

        $schoolYearIdAttach = $data['school_year_id'] ?? null;
        $schoolYearIdDetach = $data['detach_school_year_id'] ?? null;
        unset($data['school_year_id'], $data['detach_school_year_id']);

        $faculty->update($data);

        if ($schoolYearIdAttach) {
            $faculty->schoolYears()->sync([$schoolYearIdAttach]);
        }
        if ($schoolYearIdDetach) {
            $faculty->schoolYears()->detach($schoolYearIdDetach);
        }

        return response()->json(['faculty' => $faculty, 'message' => 'Faculty updated successfully']);
    }

    /**
     * Remove the specified faculty
     */
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted successfully'], 200);
    }

    public function archived()
    {
        $faculties = Faculty::where('status', 'Archived')->orderBy('created_at', 'desc')->get();
        return response()->json($faculties);
    }

    public function archive($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->status = 'Archived';
        $faculty->save();

        // Create or update archive record for this faculty (prevents duplicates)
        $archive = \App\Models\Archive::updateOrCreate(
            [
                'archivable_type' => 'App\\Models\\Faculty',
                'archivable_id' => $faculty->id,
            ],
            [
                'archive_id' => 'FAC-' . $faculty->faculty_id,
                'document_number' => \App\Models\Archive::generateDocumentNumber(),
                'reference_number' => \App\Models\Archive::generateReferenceNumber(),
                'title' => $faculty->first_name . ' ' . $faculty->last_name,
                'description' => 'Archived Faculty: ' . $faculty->first_name . ' ' . $faculty->last_name . ' (' . $faculty->faculty_id . ')',
                'document_type' => 'Faculty',
                'category' => 'Record',
                'department' => $faculty->department,
                'avatar_path' => $faculty->avatar_path,
                'archived_date' => now(),
                'archived_by' => auth()->user()->name ?? 'System',
            ]
        );

        return response()->json(['faculty' => $faculty, 'archive' => $archive, 'message' => 'Faculty archived successfully']);
    }

    public function unarchive($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->status = 'Active';
        $faculty->save();

        // Update archive record status if it exists
        \App\Models\Archive::where('archivable_type', 'App\\Models\\Faculty')
            ->where('archivable_id', $faculty->id)
            ->update(['status' => 'Active']);

        return response()->json(['faculty' => $faculty, 'message' => 'Faculty unarchived successfully']);
    }

    public function uploadAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120',
        ]);

        $faculty = Faculty::findOrFail($id);
        $file = $request->file('avatar');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/faculties');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);

        if ($faculty->avatar_path && strpos($faculty->avatar_path, 'uploads/faculties/') === 0 && file_exists(public_path($faculty->avatar_path))) {
            @unlink(public_path($faculty->avatar_path));
        }
        $faculty->avatar_path = 'uploads/faculties/' . $filename;
        $faculty->save();

        return response()->json([
            'faculty' => $faculty,
            'avatar_url' => asset($faculty->avatar_path),
            'message' => 'Avatar uploaded successfully'
        ]);
    }
}
