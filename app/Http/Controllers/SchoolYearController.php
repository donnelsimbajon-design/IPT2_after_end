<?php

namespace App\Http\Controllers;

use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Archive;
use Illuminate\Http\Request;

class SchoolYearController extends Controller
{
    public function index()
    {
        $years = SchoolYear::with(['semesters'])
            ->withCount(['semesters', 'students'])
            ->orderByDesc('start_date')
            ->get();
        return response()->json($years);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|unique:school_years,label',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:Active,Completed,Archived',
        ]);
        $year = SchoolYear::create($data);
        
        // Automatically create default semesters
        $year->semesters()->createMany([
            [
                'name' => '1st Semester',
                'start_date' => $data['start_date'] ?? null,
                'end_date' => null,
            ],
            [
                'name' => '2nd Semester',
                'start_date' => null,
                'end_date' => null,
            ],
            [
                'name' => 'Summer',
                'start_date' => null,
                'end_date' => $data['end_date'] ?? null,
            ],
        ]);
        
        // Reload with semesters
        $year->load('semesters');
        
        return response()->json(['year' => $year], 201);
    }

    public function show($id)
    {
        $year = SchoolYear::with(['semesters'])->findOrFail($id);
        return response()->json($year);
    }

    public function update(Request $request, $id)
    {
        $year = SchoolYear::findOrFail($id);
        $data = $request->validate([
            'label' => 'sometimes|required|string|unique:school_years,label,'.$id,
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:Active,Completed,Archived',
        ]);
        $year->update($data);
        return response()->json(['year' => $year]);
    }

    public function destroy($id)
    {
        $year = SchoolYear::findOrFail($id);
        $year->delete();
        return response()->json(['message' => 'Year deleted']);
    }

    // Semesters CRUD under a year
    public function addSemester(Request $request, $id)
    {
        $year = SchoolYear::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        $sem = $year->semesters()->create($data);
        return response()->json(['semester' => $sem], 201);
    }

    public function updateSemester(Request $request, $id, $semesterId)
    {
        $sem = Semester::where('school_year_id', $id)->findOrFail($semesterId);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
        ]);
        $sem->update($data);
        return response()->json(['semester' => $sem]);
    }

    public function deleteSemester($id, $semesterId)
    {
        $sem = Semester::where('school_year_id', $id)->findOrFail($semesterId);
        $sem->delete();
        return response()->json(['message' => 'Semester deleted']);
    }

    // Attach/Detach students to a school year (many-to-many)
    public function attachStudent(Request $request, $id)
    {
        $year = SchoolYear::findOrFail($id);
        $data = $request->validate(['student_id' => 'required|exists:students,id']);
        $year->students()->syncWithoutDetaching([$data['student_id']]);
        return response()->json(['message' => 'Student attached']);
    }

    public function detachStudent(Request $request, $id)
    {
        $year = SchoolYear::findOrFail($id);
        $data = $request->validate(['student_id' => 'required|exists:students,id']);
        $year->students()->detach($data['student_id']);
        return response()->json(['message' => 'Student detached']);
    }

    /**
     * Archive a school year and create an Archive record.
     */
    public function archive($id)
    {
        $year = SchoolYear::withCount(['students', 'semesters'])->findOrFail($id);
        $year->status = 'Archived';
        $year->save();

        // Create Archive record for this School Year
        $archiveId = 'SY-' . $year->id . '-' . time();
        $desc = 'School Year ' . $year->label . ' archived. ' . $year->students_count . ' students, ' . $year->semesters_count . ' semesters.';

        Archive::create([
            'archive_id' => $archiveId,
            'title' => 'School Year ' . $year->label,
            'description' => $desc,
            'document_type' => 'SchoolYear',
            'category' => 'Management',
            'department' => null,
            'reference_number' => (string)$year->id,
            'archived_date' => now()->toDateString(),
            'status' => 'Archived',
            'tags' => 'school_year',
        ]);

        return response()->json(['message' => 'School year archived', 'year' => $year]);
    }

    /**
     * Unarchive a school year and mark associated Archive entries as Active.
     */
    public function unarchive($id)
    {
        $year = SchoolYear::findOrFail($id);
        $year->status = 'Active';
        $year->save();

        // Flip archive entries to Active
        Archive::where('document_type', 'SchoolYear')
            ->where('reference_number', (string)$year->id)
            ->update(['status' => 'Active']);

        return response()->json(['message' => 'School year unarchived', 'year' => $year]);
    }
}
