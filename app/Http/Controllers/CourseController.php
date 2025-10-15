<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $dept = $request->query('department_id');
        $q = $request->query('q');
        $query = Course::query();
        if ($dept) $query->where('department_id', $dept);
        if ($q) $query->where(function($s) use ($q){
            $s->where('code','like',"%$q%")
              ->orWhere('name','like',"%$q%");
        });
        return response()->json($query->orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'code' => 'required|string|max:30|unique:courses,code',
            'name' => 'required|string',
            'status' => 'nullable|string',
        ]);
        $course = Course::create($data);
        return response()->json(['course' => $course], 201);
    }

    public function show($id)
    {
        return response()->json(Course::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $data = $request->validate([
            'department_id' => 'sometimes|nullable|exists:departments,id',
            'code' => 'sometimes|required|string|max:30|unique:courses,code,' . $id,
            'name' => 'sometimes|required|string',
            'status' => 'sometimes|nullable|string',
        ]);
        $course->update($data);
        return response()->json(['course' => $course]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }

    public function byDepartment($id)
    {
        return response()->json(Course::where('department_id', $id)->orderBy('code')->get());
    }
}
