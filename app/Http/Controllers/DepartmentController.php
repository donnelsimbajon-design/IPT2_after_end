<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(Department::orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:30|unique:departments,code',
            'name' => 'required|string',
            'chair' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'nullable|string',
        ]);
        $dept = Department::create($data);
        return response()->json(['department' => $dept], 201);
    }

    public function show($id)
    {
        return response()->json(Department::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $dept = Department::findOrFail($id);
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:30|unique:departments,code,' . $id,
            'name' => 'sometimes|required|string',
            'chair' => 'sometimes|nullable|string',
            'email' => 'sometimes|nullable|email',
            'status' => 'sometimes|nullable|string',
        ]);
        $dept->update($data);
        return response()->json(['department' => $dept]);
    }

    public function destroy($id)
    {
        $dept = Department::findOrFail($id);
        $dept->delete();
        return response()->json(['message' => 'Department deleted']);
    }

    public function archive($id)
    {
        $dept = Department::findOrFail($id);
        
        // Create archive record
        $archive = \App\Models\Archive::create([
            'archive_id' => 'DEPT-' . $dept->id . '-' . time(),
            'document_type' => 'Department',
            'document_number' => $dept->code,
            'title' => $dept->name,
            'department' => $dept->code,
            'status' => 'Archived',
            'archivable_type' => 'App\\Models\\Department',
            'archivable_id' => $dept->id,
            'archived_at' => now(),
        ]);

        // Delete the department
        $dept->delete();

        return response()->json(['message' => 'Department archived successfully', 'archive' => $archive]);
    }

    public function unarchive($id)
    {
        $dept = Department::withTrashed()->findOrFail($id);
        
        if ($dept->trashed()) {
            $dept->restore();
            return response()->json(['message' => 'Department unarchived successfully', 'department' => $dept]);
        }

        return response()->json(['message' => 'Department is not archived'], 400);
    }
}
