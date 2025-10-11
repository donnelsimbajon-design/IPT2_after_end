<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\SchoolYear;
use App\Models\Semester;

class SchoolYearSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 2024–2025 Active
            $sy2025 = SchoolYear::firstOrCreate(
                ['label' => '2024–2025'],
                [
                    'start_date' => '2024-08-26',
                    'end_date' => '2025-05-09',
                    'status' => 'Active',
                ]
            );

            $semesters2025 = [
                ['name' => '1st semester 2024–2025', 'start_date' => '2024-08-26', 'end_date' => '2024-12-20'],
                ['name' => '2nd semester 2024–2025', 'start_date' => '2025-01-13', 'end_date' => '2025-05-09'],
                ['name' => 'Summer 2024', 'start_date' => '2024-05-20', 'end_date' => '2024-08-16'],
            ];

            foreach ($semesters2025 as $sem) {
                Semester::firstOrCreate(
                    ['school_year_id' => $sy2025->id, 'name' => $sem['name']],
                    ['start_date' => $sem['start_date'], 'end_date' => $sem['end_date']]
                );
            }

            // 2023–2024 Completed
            $sy2024 = SchoolYear::firstOrCreate(
                ['label' => '2023–2024'],
                [
                    'start_date' => '2023-08-28',
                    'end_date' => '2024-05-10',
                    'status' => 'Completed',
                ]
            );

            $semesters2024 = [
                ['name' => '1st semester 2023–2024', 'start_date' => '2023-08-28', 'end_date' => '2023-12-22'],
                ['name' => '2nd semester 2023–2024', 'start_date' => '2024-01-15', 'end_date' => '2024-05-10'],
            ];

            foreach ($semesters2024 as $sem) {
                Semester::firstOrCreate(
                    ['school_year_id' => $sy2024->id, 'name' => $sem['name']],
                    ['start_date' => $sem['start_date'], 'end_date' => $sem['end_date']]
                );
            }
        });
    }
}
