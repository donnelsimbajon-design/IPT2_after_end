<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;

class DepartmentCourseSeeder extends Seeder
{
    public function run(): void
    {
        $csp = Department::firstOrCreate(
            ['code' => 'CSP'],
            ['name' => 'COMPUTER SCIENCE PROGRAM', 'status' => 'Active']
        );

        Course::updateOrCreate(
            ['code' => 'BSIT'],
            ['name' => 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY', 'department_id' => $csp->id, 'status' => 'Active']
        );

        Course::updateOrCreate(
            ['code' => 'BSCS'],
            ['name' => 'BACHELOR OF SCIENCE IN COMPUTER SCIENCE', 'department_id' => $csp->id, 'status' => 'Active']
        );
    }
}
