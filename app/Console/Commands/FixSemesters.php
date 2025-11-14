<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SchoolYear;
use App\Models\Semester;

class FixSemesters extends Command
{
    protected $signature = 'semesters:fix';
    protected $description = 'Fix semester naming and ensure proper structure';

    public function handle()
    {
        $this->info('Fixing semesters...');

        // First, set all students and faculty semester_id to NULL
        \DB::table('students')->update(['semester_id' => null]);
        \DB::table('faculties')->update(['semester_id' => null]);
        $this->info('Cleared semester assignments from students and faculty');

        // Delete all existing semesters
        Semester::query()->delete();
        $this->info('Deleted all existing semesters');

        // Get all school years
        $schoolYears = SchoolYear::all();

        foreach ($schoolYears as $year) {
            // Create standardized semesters for each school year
            $year->semesters()->createMany([
                [
                    'name' => '1st Semester',
                    'start_date' => $year->start_date,
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
                    'end_date' => $year->end_date,
                ],
            ]);

            $this->info("✓ Created semesters for '{$year->label}'");
        }

        // Update all students and faculty to use the first available semester
        $firstSemester = Semester::orderBy('id')->first();
        if ($firstSemester) {
            \DB::table('students')->update(['semester_id' => $firstSemester->id]);
            \DB::table('faculties')->update(['semester_id' => $firstSemester->id]);
            $this->info("✓ Assigned all students and faculty to '{$firstSemester->name}'");
        }

        $this->info('');
        $this->info('✅ Done! All semesters have been fixed.');

        return 0;
    }
}
