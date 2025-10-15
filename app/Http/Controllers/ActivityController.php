<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\LoginActivity;

class ActivityController extends Controller
{
    public function summary(Request $request)
    {
        $month = $request->query('month');
        $start = $month ? Carbon::parse($month . '-01')->startOfMonth() : Carbon::now()->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $rangeDates = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) { $rangeDates[$cursor->toDateString()] = ['date' => $cursor->toDateString(), 'students' => 0, 'faculties' => 0, 'offerings' => 0, 'logins' => 0]; $cursor->addDay(); }

        $students = Student::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')->pluck('c','d');
        foreach ($students as $d => $c) { if (isset($rangeDates[$d])) $rangeDates[$d]['students'] = (int)$c; }

        $faculties = Faculty::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')->pluck('c','d');
        foreach ($faculties as $d => $c) { if (isset($rangeDates[$d])) $rangeDates[$d]['faculties'] = (int)$c; }

        if (Schema::hasTable('offerings')) {
            $offerings = DB::table('offerings')
                ->whereBetween('created_at', [$start, $end])
                ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
                ->groupBy('d')->pluck('c','d');
            foreach ($offerings as $d => $c) { if (isset($rangeDates[$d])) $rangeDates[$d]['offerings'] = (int)$c; }
        }

        if (Schema::hasTable('login_activities')) {
            $logins = LoginActivity::query()
                ->whereBetween('created_at', [$start, $end])
                ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
                ->groupBy('d')->pluck('c','d');
            foreach ($logins as $d => $c) { if (isset($rangeDates[$d])) $rangeDates[$d]['logins'] = (int)$c; }
        }

        return response()->json(array_values($rangeDates));
    }

    public function day(Request $request)
    {
        $date = $request->query('date');
        if (!$date) { return response()->json(['items' => []]); }
        $start = Carbon::parse($date)->startOfDay();
        $end = Carbon::parse($date)->endOfDay();

        $items = [];

        foreach (Student::query()->whereBetween('created_at', [$start, $end])->orderBy('created_at','desc')->limit(200)->get() as $s) {
            $items[] = [
                'time' => Carbon::parse($s->created_at)->toDateTimeString(),
                'type' => 'student_created',
                'label' => trim(($s->first_name ?? '').' '.($s->last_name ?? '')) ?: 'Student',
                'meta' => ['id' => $s->id, 'student_id' => $s->student_id]
            ];
        }
        foreach (Faculty::query()->whereBetween('created_at', [$start, $end])->orderBy('created_at','desc')->limit(200)->get() as $f) {
            $items[] = [
                'time' => Carbon::parse($f->created_at)->toDateTimeString(),
                'type' => 'faculty_created',
                'label' => trim(($f->first_name ?? '').' '.($f->last_name ?? '')) ?: 'Faculty',
                'meta' => ['id' => $f->id, 'faculty_id' => $f->faculty_id]
            ];
        }
        if (Schema::hasTable('offerings')) {
            foreach (DB::table('offerings')->whereBetween('created_at', [$start, $end])->orderBy('created_at','desc')->limit(200)->get() as $o) {
                $items[] = [
                    'time' => Carbon::parse($o->created_at)->toDateTimeString(),
                    'type' => 'offering_created',
                    'label' => ($o->subject_code ?? 'Offering'),
                    'meta' => ['id' => $o->id]
                ];
            }
        }
        if (Schema::hasTable('login_activities')) {
            foreach (LoginActivity::query()->whereBetween('created_at', [$start, $end])->orderBy('created_at','desc')->limit(200)->get() as $la) {
                $items[] = [
                    'time' => Carbon::parse($la->created_at)->toDateTimeString(),
                    'type' => 'login',
                    'label' => $la->ip_address ?? 'Login',
                    'meta' => ['id' => $la->id]
                ];
            }
        }

        usort($items, function($a,$b){ return strcmp($b['time'],$a['time']); });
        return response()->json(['items' => $items]);
    }
}
