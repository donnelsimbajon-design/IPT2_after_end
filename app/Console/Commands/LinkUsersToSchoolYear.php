<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\SchoolYear;
use App\Models\Semester;

class LinkUsersToSchoolYear extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:link-school-year';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Link all students and faculty to the active school year and assign semesters';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting to link students and faculty to school years...');

        // Get the active school year
        $activeSchoolYear = SchoolYear::where('status', 'Active')->first();
        
        if (!$activeSchoolYear) {
            $this->error('No active school year found!');
            return 1;
        }

        $this->info("Using school year: {$activeSchoolYear->label}");

        // Get first available semester
        $semester = Semester::first();
        if (!$semester) {
            $this->warn('No semesters found in database. Students/faculty will not have semester_id assigned.');
        } else {
            $this->info("Using semester: {$semester->name} (ID: {$semester->id})");
        }

        // Process Students
        $students = Student::all();
        $studentCount = 0;
        $studentUpdated = 0;

        foreach ($students as $student) {
            // Link to school year via pivot table if not already linked
            if (!$student->schoolYears->contains($activeSchoolYear->id)) {
                $student->schoolYears()->attach($activeSchoolYear->id);
                $studentCount++;
            }

            // Assign semester_id if not set and semester exists
            if (!$student->semester_id && $semester) {
                $student->semester_id = $semester->id;
                $student->save();
                $studentUpdated++;
            }
        }

        $this->info("✓ Linked {$studentCount} students to school year {$activeSchoolYear->label}");
        $this->info("✓ Assigned semester to {$studentUpdated} students");

        // Process Faculty
        $faculties = Faculty::all();
        $facultyCount = 0;
        $facultyUpdated = 0;

        foreach ($faculties as $faculty) {
            // Link to school year via pivot table if not already linked
            if (!$faculty->schoolYears->contains($activeSchoolYear->id)) {
                $faculty->schoolYears()->attach($activeSchoolYear->id);
                $facultyCount++;
            }

            // Assign semester_id if not set and semester exists
            if (!$faculty->semester_id && $semester) {
                $faculty->semester_id = $semester->id;
                $faculty->save();
                $facultyUpdated++;
            }
        }

        $this->info("✓ Linked {$facultyCount} faculty to school year {$activeSchoolYear->label}");
        $this->info("✓ Assigned semester to {$facultyUpdated} faculty");

        $this->info('');
        $this->info('Summary:');
        $this->info("- Total students processed: {$students->count()}");
        $this->info("- Total faculty processed: {$faculties->count()}");
        $this->info("- Students linked to school year: {$studentCount}");
        $this->info("- Faculty linked to school year: {$facultyCount}");
        $this->info("- Students with semester assigned: {$studentUpdated}");
        $this->info("- Faculty with semester assigned: {$facultyUpdated}");
        
        $this->info('');
        $this->info('✅ Done! All users have been linked to school year and semester.');

        return 0;
    }
}
