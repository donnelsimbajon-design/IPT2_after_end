<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\SchoolYear;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     */
    public function index()
    {
        $q = request()->query('q');
        $program = request()->query('program');
        $department = request()->query('department');
        $yearLevel = request()->query('year_level');
        $status = request()->query('status');
        $schoolYear = request()->query('school_year'); // filter by enrollment calendar year (legacy)
        $schoolYearId = request()->query('school_year_id'); // filter by school_years.id via pivot
        $semesterId = request()->query('semester_id'); // filter by semester_id column

        $query = Student::query();
        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('first_name', 'like', "%$q%")
                    ->orWhere('last_name', 'like', "%$q%")
                    ->orWhere('student_id', 'like', "%$q%")
                    ->orWhere('email', 'like', "%$q%");
            });
        }
        if ($program) { $query->where('program', $program); }
        if ($department) { $query->where('department', $department); }
        if ($yearLevel) { $query->where('year_level', $yearLevel); }
        if ($status) { $query->where('status', $status); }
        if ($schoolYear) { $query->whereYear('enrollment_date', $schoolYear); }
        if ($semesterId) { $query->where('semester_id', $semesterId); }
        if ($schoolYearId) {
            $query->whereHas('schoolYears', function($sq) use ($schoolYearId) {
                $sq->where('school_years.id', $schoolYearId);
            });
        }

        if (!$status && !request()->boolean('include_archived')) {
            $query->where('status', '!=', 'Archived');
        }

        $students = $query->with(['schoolYears', 'semester'])->orderBy('created_at', 'desc')->get();
        return response()->json($students);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'nullable|string|unique:students,student_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'address' => 'nullable|string',
            'region' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'enrollment_date' => 'nullable|date',
            'program' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:50',
            'semester_id' => 'nullable|exists:semesters,id',
            'status' => 'nullable|in:Active,Inactive,Graduated,Suspended,Archived',
            'school_year_id' => 'nullable|exists:school_years,id',
        ]);

        if (empty($data['status'])) {
            $data['status'] = 'Active';
        }
        if (empty($data['enrollment_date'])) {
            $data['enrollment_date'] = now()->toDateString();
        }

        // Auto-generate student_id if missing (format: STU-YYYY-XXX)
        if (empty($data['student_id'])) {
            $year = date('Y');
            $prefix = 'STU-' . $year . '-';
            $last = Student::where('student_id', 'like', $prefix . '%')
                ->orderBy('student_id', 'desc')
                ->value('student_id');
            $seq = 1;
            if ($last) {
                $n = (int)preg_replace('/^'.preg_quote($prefix, '/').'/', '', $last);
                $seq = $n + 1;
            }
            $data['student_id'] = $prefix . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);
        }

        try {
            $schoolYearIdToAttach = $data['school_year_id'] ?? null;
            unset($data['school_year_id']);

            $student = Student::create($data);

            if ($schoolYearIdToAttach) {
                $student->schoolYears()->syncWithoutDetaching([$schoolYearIdToAttach]);
            }
            return response()->json(['student' => $student, 'message' => 'Student created successfully'], 201);
        } catch (\Throwable $e) {
            \Log::error('Student store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating student',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified student
     */
    public function show($id)
    {
        $student = Student::with(['schoolYears', 'semester'])->findOrFail($id);
        return response()->json($student);
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $data = $request->validate([
            'student_id' => 'sometimes|required|string|unique:students,student_id,' . $id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|required|email|unique:students,email,' . $id,
            'phone' => 'sometimes|nullable|string|max:50',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|in:Male,Female,Other',
            'address' => 'sometimes|nullable|string',
            'region' => 'sometimes|nullable|string|max:255',
            'province' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:255',
            'state' => 'sometimes|nullable|string|max:255',
            'zip_code' => 'sometimes|nullable|string|max:50',
            'country' => 'sometimes|nullable|string|max:255',
            'enrollment_date' => 'sometimes|nullable|date',
            'program' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'course' => 'sometimes|nullable|string|max:255',
            'year_level' => 'sometimes|nullable|string|max:50',
            'status' => 'sometimes|nullable|in:Active,Inactive,Graduated,Suspended,Archived',
            'semester_id' => 'sometimes|nullable|exists:semesters,id',
            'school_year_id' => 'sometimes|nullable|exists:school_years,id',
            'detach_school_year_id' => 'sometimes|nullable|exists:school_years,id',
        ]);

        $schoolYearIdAttach = $data['school_year_id'] ?? null;
        $schoolYearIdDetach = $data['detach_school_year_id'] ?? null;
        unset($data['school_year_id'], $data['detach_school_year_id']);

        $student->update($data);

        if ($schoolYearIdAttach) {
            $student->schoolYears()->sync([$schoolYearIdAttach]);
        }
        if ($schoolYearIdDetach) {
            $student->schoolYears()->detach($schoolYearIdDetach);
        }
        return response()->json(['student' => $student, 'message' => 'Student updated successfully']);
    }

    /**
     * Remove the specified student
     */
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();
        return response()->json(['message' => 'Student deleted successfully'], 200);
    }

    /**
     * Upload student avatar
     */
    public function uploadAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120',
        ]);

        $student = Student::findOrFail($id);
        $file = $request->file('avatar');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/students');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);

        // delete old avatar if under our uploads dir
        if ($student->avatar_path && strpos($student->avatar_path, 'uploads/students/') === 0 && file_exists(public_path($student->avatar_path))) {
            @unlink(public_path($student->avatar_path));
        }
        $student->avatar_path = 'uploads/students/' . $filename;
        $student->save();

        return response()->json([
            'student' => $student,
            'avatar_url' => asset($student->avatar_path),
            'message' => 'Avatar uploaded successfully'
        ]);
    }

    public function archived()
    {
        $students = Student::where('status', 'Archived')->orderBy('created_at', 'desc')->get();
        return response()->json($students);
    }

    public function archive($id)
    {
        $student = Student::findOrFail($id);
        $student->status = 'Archived';
        $student->save();

        // Create or update archive record for this student (prevents duplicates)
        $archive = \App\Models\Archive::updateOrCreate(
            [
                'archivable_type' => 'App\\Models\\Student',
                'archivable_id' => $student->id,
            ],
            [
                'archive_id' => 'STU-' . $student->student_id,
                'document_number' => \App\Models\Archive::generateDocumentNumber(),
                'reference_number' => \App\Models\Archive::generateReferenceNumber(),
                'title' => $student->first_name . ' ' . $student->last_name,
                'description' => 'Archived Student: ' . $student->first_name . ' ' . $student->last_name . ' (' . $student->student_id . ')',
                'document_type' => 'Student',
                'category' => 'Record',
                'department' => $student->department,
                'avatar_path' => $student->avatar_path,
                'archived_date' => now(),
                'archived_by' => auth()->user()->name ?? 'System',
            ]
        );

        return response()->json(['student' => $student, 'archive' => $archive, 'message' => 'Student archived successfully']);
    }

    public function unarchive($id)
    {
        $student = Student::findOrFail($id);
        $student->status = 'Active';
        $student->save();

        // Update archive record status if it exists
        \App\Models\Archive::where('archivable_type', 'App\\Models\\Student')
            ->where('archivable_id', $student->id)
            ->update(['status' => 'Active']);

        return response()->json(['student' => $student, 'message' => 'Student unarchived successfully']);
    }
}
