<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $dept = $request->query('department_id');
        $q = $request->query('q');
        $query = Subject::query();
        if ($dept) $query->where('department_id', $dept);
        if ($q) $query->where(function($s) use ($q){
            $s->where('code','like',"%$q%")
              ->orWhere('description','like',"%$q%");
        });
        return response()->json($query->orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'required|string',
            'lec_default' => 'nullable|integer|min:0',
            'lab_default' => 'nullable|integer|min:0',
            'unit_default' => 'nullable|integer|min:0',
            'status' => 'nullable|string',
        ]);
        $subject = Subject::create($data);
        return response()->json(['subject' => $subject], 201);
    }

    public function show($id)
    {
        return response()->json(Subject::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);
        $data = $request->validate([
            'department_id' => 'sometimes|nullable|exists:departments,id',
            'code' => 'sometimes|required|string|max:50|unique:subjects,code,' . $id,
            'description' => 'sometimes|required|string',
            'lec_default' => 'sometimes|nullable|integer|min:0',
            'lab_default' => 'sometimes|nullable|integer|min:0',
            'unit_default' => 'sometimes|nullable|integer|min:0',
            'status' => 'sometimes|nullable|string',
        ]);
        $subject->update($data);
        return response()->json(['subject' => $subject]);
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();
        return response()->json(['message' => 'Subject deleted']);
    }

    public function byDepartment($id)
    {
        return response()->json(Subject::where('department_id', $id)->orderBy('code')->get());
    }
}
