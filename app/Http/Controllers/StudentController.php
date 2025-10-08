<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     */
    public function index()
    {
        $students = Student::orderBy('created_at', 'desc')->get();
        return response()->json($students);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|string|unique:students,student_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'enrollment_date' => 'nullable|date',
            'program' => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive,Graduated,Suspended,Archived',
        ]);

        try {
            $student = Student::create($data);
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
        $student = Student::findOrFail($id);
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
            'city' => 'sometimes|nullable|string|max:255',
            'state' => 'sometimes|nullable|string|max:255',
            'zip_code' => 'sometimes|nullable|string|max:50',
            'country' => 'sometimes|nullable|string|max:255',
            'enrollment_date' => 'sometimes|nullable|date',
            'program' => 'sometimes|nullable|string|max:255',
            'year_level' => 'sometimes|nullable|string|max:50',
            'status' => 'sometimes|nullable|in:Active,Inactive,Graduated,Suspended,Archived',
        ]);

        $student->update($data);
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
}
