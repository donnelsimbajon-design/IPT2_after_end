<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SchoolYear;

class AddSemestersToSchoolYears extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'school-years:add-semesters';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add default semesters to school years that don\'t have them';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Adding semesters to school years...');

        $schoolYears = SchoolYear::with('semesters')->get();
        $updated = 0;

        foreach ($schoolYears as $year) {
            // Check if this school year already has semesters
            if ($year->semesters->count() > 0) {
                $this->info("School Year '{$year->label}' already has {$year->semesters->count()} semester(s)");
                continue;
            }

            // Create default semesters
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

            $this->info("✓ Added 3 semesters to '{$year->label}'");
            $updated++;
        }

        $this->info('');
        $this->info("Summary:");
        $this->info("- Total school years: {$schoolYears->count()}");
        $this->info("- Updated with semesters: {$updated}");
        $this->info('');
        $this->info('✅ Done!');

        return 0;
    }
}
