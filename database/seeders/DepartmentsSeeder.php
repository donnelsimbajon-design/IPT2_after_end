<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'code' => 'CSP',
                'name' => 'Computer Science Program',
                'chair' => 'Dr. John Smith',
                'email' => 'csp@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'AP',
                'name' => 'Accountancy Program',
                'chair' => 'Prof. Jane Doe',
                'email' => 'ap@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'BAP',
                'name' => 'Business Administration Program',
                'chair' => 'Dr. Robert Johnson',
                'email' => 'bap@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'NP',
                'name' => 'Nursing Program',
                'chair' => 'Dr. Mary Williams',
                'email' => 'np@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'ICJ',
                'name' => 'Criminology Program',
                'chair' => 'Prof. James Brown',
                'email' => 'icj@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'TEP',
                'name' => 'Teacher Education Program',
                'chair' => 'Dr. Patricia Davis',
                'email' => 'tep@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => 'ETP',
                'name' => 'Engineering Technology Program',
                'chair' => 'Engr. Michael Wilson',
                'email' => 'etp@university.edu',
                'status' => 'Active',
            ],
            // Old numeric codes for backward compatibility
            [
                'code' => '102',
                'name' => 'Department 102',
                'chair' => 'TBA',
                'email' => 'dept102@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => '103',
                'name' => 'Department 103',
                'chair' => 'TBA',
                'email' => 'dept103@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => '104',
                'name' => 'Department 104',
                'chair' => 'TBA',
                'email' => 'dept104@university.edu',
                'status' => 'Active',
            ],
            [
                'code' => '105',
                'name' => 'Department 105',
                'chair' => 'TBA',
                'email' => 'dept105@university.edu',
                'status' => 'Active',
            ],
        ];

        foreach ($departments as $department) {
            DB::table('departments')->updateOrInsert(
                ['code' => $department['code']],
                $department
            );
        }
    }
}
