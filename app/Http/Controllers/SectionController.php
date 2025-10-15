<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Course;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $courseId = $request->query('course_id');
        $courseCode = $request->query('course_code');
        $year = $request->query('year_level');
        $q = $request->query('q');

        $query = Section::query()->with('course');
        if ($courseId) $query->where('course_id', $courseId);
        if ($year) $query->where('year_level', $year);
        if ($q) $query->where(function($s) use ($q){
            $s->where('label','like',"%$q%")
              ->orWhere('code','like',"%$q%");
        });
        if ($courseCode) {
            $query->whereHas('course', function($c) use ($courseCode){
                $c->where('code', $courseCode);
            });
        }
        return response()->json($query->orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'nullable|string|max:20',
            'label' => 'required|string|max:50',
            'code' => 'required|string|max:100|unique:sections,code',
        ]);
        $section = Section::create($data);
        return response()->json(['section' => $section], 201);
    }

    public function show($id)
    {
        return response()->json(Section::with('course')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        $data = $request->validate([
            'course_id' => 'sometimes|required|exists:courses,id',
            'year_level' => 'sometimes|nullable|string|max:20',
            'label' => 'sometimes|required|string|max:50',
            'code' => 'sometimes|required|string|max:100|unique:sections,code,' . $id,
        ]);
        $section->update($data);
        return response()->json(['section' => $section]);
    }

    public function destroy($id)
    {
        $section = Section::findOrFail($id);
        $section->delete();
        return response()->json(['message' => 'Section deleted']);
    }
}
