<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Offering;
use App\Models\Section;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Department;

class OfferingController extends Controller
{
    public function index(Request $request)
    {
        $deptId = $request->query('department_id');
        $courseId = $request->query('course_id');
        $courseCode = $request->query('course_code');
        $subjectId = $request->query('subject_id');
        $year = $request->query('year_level');
        $sectionLabel = $request->query('section_label');
        $sectionCode = $request->query('section_code');
        $q = $request->query('q');

        $query = Offering::query()->with(['section.course.department', 'subject.department', 'section.course']);

        if ($subjectId) $query->where('subject_id', $subjectId);
        if ($q) {
            $query->where(function($s) use ($q){
                $s->where('room', 'like', "%$q%")
                  ->orWhere('schedule','like',"%$q%");
            });
        }
        if ($year || $sectionLabel || $sectionCode || $courseId || $courseCode || $deptId) {
            $query->whereHas('section', function($sec) use ($year, $sectionLabel, $sectionCode, $courseId, $courseCode, $deptId){
                if ($year) $sec->where('year_level', $year);
                if ($sectionLabel) $sec->where('label', $sectionLabel);
                if ($sectionCode) $sec->where('code', $sectionCode);
                if ($courseId || $courseCode || $deptId) {
                    $sec->whereHas('course', function($c) use ($courseId, $courseCode, $deptId){
                        if ($courseId) $c->where('id', $courseId);
                        if ($courseCode) $c->where('code', $courseCode);
                        if ($deptId) $c->where('department_id', $deptId);
                    });
                }
            });
        }

        return response()->json($query->orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'lec' => 'nullable|integer|min:0',
            'lab' => 'nullable|integer|min:0',
            'units' => 'nullable|integer|min:0',
            'room' => 'nullable|string|max:100',
            'schedule' => 'nullable|string|max:255',
        ]);
        $off = Offering::create($data);
        return response()->json(['offering' => $off], 201);
    }

    public function update(Request $request, $id)
    {
        $off = Offering::findOrFail($id);
        $data = $request->validate([
            'section_id' => 'sometimes|required|exists:sections,id',
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'lec' => 'sometimes|nullable|integer|min:0',
            'lab' => 'sometimes|nullable|integer|min:0',
            'units' => 'sometimes|nullable|integer|min:0',
            'room' => 'sometimes|nullable|string|max:100',
            'schedule' => 'sometimes|nullable|string|max:255',
        ]);
        $off->update($data);
        return response()->json(['offering' => $off]);
    }

    public function destroy($id)
    {
        $off = Offering::findOrFail($id);
        $off->delete();
        return response()->json(['message' => 'Offering deleted']);
    }

    public function import(Request $request)
    {
        $payload = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.year_level' => 'nullable|string|max:40',
            'items.*.course_code' => 'nullable|string|max:40',
            'items.*.section_label' => 'nullable|string|max:40',
            'items.*.section_code' => 'nullable|string|max:100',
            'items.*.subject_code' => 'required|string|max:100',
            'items.*.subject_description' => 'required|string|max:255',
            'items.*.lec' => 'nullable|integer|min:0',
            'items.*.lab' => 'nullable|integer|min:0',
            'items.*.units' => 'nullable|integer|min:0',
            'items.*.room' => 'nullable|string|max:100',
            'items.*.schedule' => 'nullable|string|max:255',
            'items.*.department_code' => 'nullable|string|max:30',
            'replace' => 'nullable|boolean'
        ]);

        $items = $payload['items'];
        $replace = (bool)($payload['replace'] ?? false);

        DB::beginTransaction();
        try {
            // If replace: delete existing offerings for the target Sections before import
            if ($replace) {
                $targets = collect($items)->map(function($i){
                    return [
                        'course_code' => $i['course_code'] ?? null,
                        'section_code' => $i['section_code'] ?? null,
                        'year_level' => $i['year_level'] ?? null,
                        'section_label' => $i['section_label'] ?? null,
                    ];
                })->unique();

                foreach ($targets as $t) {
                    $course = null;
                    if (!empty($t['course_code'])) {
                        $course = Course::where('code', $t['course_code'])->first();
                    }
                    $section = Section::query()
                        ->when($t['section_code'], function($q) use ($t){ return $q->where('code', $t['section_code']); })
                        ->when($t['section_label'], function($q) use ($t){ return $q->where('label', $t['section_label']); })
                        ->when($t['year_level'], function($q) use ($t){ return $q->where('year_level', $t['year_level']); })
                        ->when($course, function($q) use ($course){ return $q->where('course_id', $course ? $course->id : null); })
                        ->first();
                    if ($section) {
                        Offering::where('section_id', $section->id)->delete();
                    }
                }
            }

            $count = 0;
            foreach ($items as $i) {
                $course = null;
                if (!empty($i['course_code'])) {
                    $deptId = null;
                    $codeUp = strtoupper($i['course_code']);
                    if (preg_match('/^(BSIT|BSCS|BSEMC|DIT|IT|CS)/', $codeUp)) {
                        $csp = \App\Models\Department::where('code', 'CSP')->first();
                        if ($csp) $deptId = $csp->id;
                    }
                    $course = Course::updateOrCreate(
                        ['code' => $i['course_code']],
                        ['name' => $i['course_code'], 'department_id' => $deptId]
                    );
                }

                $sectionCode = $i['section_code'] ?? null;
                $sectionLabel = $i['section_label'] ?? null;
                $yearLevel = $i['year_level'] ?? null;

                if (!$sectionCode && $course && $sectionLabel && $yearLevel) {
                    // Attempt to build a code like "BSIT 1-IT11"
                    $num = preg_match('/FIRST/i', $yearLevel) ? '1' : (preg_match('/SECOND/i', $yearLevel) ? '2' : (preg_match('/THIRD/i', $yearLevel) ? '3' : (preg_match('/FOURTH/i', $yearLevel) ? '4' : '')));
                    if ($num) $sectionCode = $course->code . ' ' . $num . '-' . $sectionLabel;
                }

                $fallbackCode = '';
                if (!$sectionCode) {
                    $fallbackCode = ($course ? $course->code : '') . '-' . ($sectionLabel ?: '');
                }
                $section = Section::firstOrCreate(
                    ['code' => $sectionCode ?: $fallbackCode],
                    [
                        'course_id' => $course ? $course->id : null,
                        'year_level' => $yearLevel,
                        'label' => $sectionLabel,
                    ]
                );

                $subject = Subject::firstOrCreate(
                    ['code' => $i['subject_code']],
                    [
                        'description' => $i['subject_description'],
                        'department_id' => $course ? $course->department_id : null,
                        'lec_default' => (int)($i['lec'] ?? 0),
                        'lab_default' => (int)($i['lab'] ?? 0),
                        'unit_default' => (int)($i['units'] ?? 0),
                    ]
                );

                // Optionally keep subject description fresh
                if ($subject->description !== $i['subject_description']) {
                    $subject->description = $i['subject_description'];
                    $subject->save();
                }

                Offering::create([
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                    'lec' => (int)($i['lec'] ?? 0),
                    'lab' => (int)($i['lab'] ?? 0),
                    'units' => (int)($i['units'] ?? 0),
                    'room' => $i['room'] ?? null,
                    'schedule' => $i['schedule'] ?? null,
                ]);
                $count++;
            }

            DB::commit();
            return response()->json(['message' => 'Imported offerings', 'count' => $count]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Import failed', 'error' => config('app.debug') ? $e->getMessage() : null], 500);
        }
    }
}
