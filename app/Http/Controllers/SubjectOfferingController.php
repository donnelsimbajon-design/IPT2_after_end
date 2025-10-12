<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubjectOffering;
use Illuminate\Support\Facades\DB;

class SubjectOfferingController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $year = $request->query('year_level');
        $course = $request->query('course_code');
        $section = $request->query('section_label');

        $query = SubjectOffering::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('subject_code', 'like', "%$q%")
                  ->orWhere('subject_description', 'like', "%$q%")
                  ->orWhere('section_code', 'like', "%$q%")
                  ->orWhere('schedule', 'like', "%$q%");
            });
        }
        if ($year) $query->where('year_level', $year);
        if ($course) $query->where('course_code', $course);
        if ($section) $query->where('section_label', $section);

        return response()->json($query->orderBy('section_code')->orderBy('subject_code')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateItem($request);
        $item = SubjectOffering::create($data);
        return response()->json(['offering' => $item, 'message' => 'Subject offering created'], 201);
    }

    public function update(Request $request, $id)
    {
        $item = SubjectOffering::findOrFail($id);
        $data = $this->validateItem($request, true);
        $item->update($data);
        return response()->json(['offering' => $item, 'message' => 'Subject offering updated']);
    }

    public function destroy($id)
    {
        $item = SubjectOffering::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Subject offering deleted']);
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
            'replace' => 'nullable|boolean'
        ]);

        $items = $payload['items'];
        $replace = (bool)($payload['replace'] ?? false);

        DB::beginTransaction();
        try {
            if ($replace) {
                $combos = collect($items)->map(function ($i) {
                    return [
                        'year_level' => $i['year_level'] ?? null,
                        'course_code' => $i['course_code'] ?? null,
                        'section_label' => $i['section_label'] ?? null,
                    ];
                })->unique();
                foreach ($combos as $c) {
                    SubjectOffering::where('year_level', $c['year_level'])
                        ->where('course_code', $c['course_code'])
                        ->where('section_label', $c['section_label'])
                        ->delete();
                }
            }
            foreach ($items as $i) {
                SubjectOffering::create([
                    'year_level' => $i['year_level'] ?? null,
                    'course_code' => $i['course_code'] ?? null,
                    'section_label' => $i['section_label'] ?? null,
                    'section_code' => $i['section_code'] ?? null,
                    'subject_code' => $i['subject_code'],
                    'subject_description' => $i['subject_description'],
                    'lec' => (int)($i['lec'] ?? 0),
                    'lab' => (int)($i['lab'] ?? 0),
                    'units' => (int)($i['units'] ?? 0),
                    'room' => $i['room'] ?? null,
                    'schedule' => $i['schedule'] ?? null,
                ]);
            }
            DB::commit();
            return response()->json(['message' => 'Imported subject offerings', 'count' => count($items)]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Import failed', 'error' => config('app.debug') ? $e->getMessage() : null], 500);
        }
    }

    private function validateItem(Request $request, bool $partial = false): array
    {
        $rules = [
            'year_level' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:40',
            'course_code' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:40',
            'section_label' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:40',
            'section_code' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:100',
            'subject_code' => ($partial ? 'sometimes|' : '') . 'required|string|max:100',
            'subject_description' => ($partial ? 'sometimes|' : '') . 'required|string|max:255',
            'lec' => ($partial ? 'sometimes|' : '') . 'nullable|integer|min:0',
            'lab' => ($partial ? 'sometimes|' : '') . 'nullable|integer|min:0',
            'units' => ($partial ? 'sometimes|' : '') . 'nullable|integer|min:0',
            'room' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:100',
            'schedule' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:255',
        ];
        return $request->validate($rules);
    }
}
