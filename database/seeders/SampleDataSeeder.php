<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\SystemSetting;
use App\Models\Report;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Sample Students
        Student::create([
            'student_id' => 'STU-2024-001',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'middle_name' => 'Santos',
            'email' => 'juan.delacruz@example.com',
            'phone' => '09123456789',
            'date_of_birth' => '2000-05-15',
            'gender' => 'Male',
            'address' => '123 Main Street',
            'city' => 'Manila',
            'state' => 'Metro Manila',
            'zip_code' => '1000',
            'country' => 'Philippines',
            'enrollment_date' => '2024-08-01',
            'program' => 'Computer Science',
            'year_level' => '3rd Year',
            'status' => 'Active',
        ]);

        Student::create([
            'student_id' => 'STU-2024-002',
            'first_name' => 'Maria',
            'last_name' => 'Garcia',
            'middle_name' => 'Reyes',
            'email' => 'maria.garcia@example.com',
            'phone' => '09187654321',
            'date_of_birth' => '2001-03-20',
            'gender' => 'Female',
            'address' => '456 Oak Avenue',
            'city' => 'Quezon City',
            'state' => 'Metro Manila',
            'zip_code' => '1100',
            'country' => 'Philippines',
            'enrollment_date' => '2024-08-01',
            'program' => 'Information Technology',
            'year_level' => '2nd Year',
            'status' => 'Active',
        ]);

        // Sample Faculty
        Faculty::create([
            'faculty_id' => 'FAC-2024-001',
            'first_name' => 'Dr. Roberto',
            'last_name' => 'Santos',
            'middle_name' => 'Cruz',
            'email' => 'roberto.santos@example.com',
            'phone' => '09171234567',
            'date_of_birth' => '1980-07-10',
            'gender' => 'Male',
            'address' => '789 University Road',
            'city' => 'Manila',
            'state' => 'Metro Manila',
            'zip_code' => '1000',
            'country' => 'Philippines',
            'department' => 'Computer Science',
            'position' => 'Professor',
            'specialization' => 'Artificial Intelligence',
            'hire_date' => '2010-06-01',
            'employment_type' => 'Full-time',
            'status' => 'Active',
        ]);

        Faculty::create([
            'faculty_id' => 'FAC-2024-002',
            'first_name' => 'Prof. Ana',
            'last_name' => 'Mendoza',
            'middle_name' => 'Lopez',
            'email' => 'ana.mendoza@example.com',
            'phone' => '09189876543',
            'date_of_birth' => '1985-11-25',
            'gender' => 'Female',
            'address' => '321 College Street',
            'city' => 'Makati',
            'state' => 'Metro Manila',
            'zip_code' => '1200',
            'country' => 'Philippines',
            'department' => 'Information Technology',
            'position' => 'Associate Professor',
            'specialization' => 'Web Development',
            'hire_date' => '2015-08-15',
            'employment_type' => 'Full-time',
            'status' => 'Active',
        ]);

        // Sample System Settings
        SystemSetting::create([
            'setting_key' => 'app_name',
            'setting_value' => 'School Management System',
            'setting_type' => 'text',
            'category' => 'General',
            'description' => 'Application name displayed throughout the system',
            'is_public' => true,
        ]);

        SystemSetting::create([
            'setting_key' => 'max_students_per_class',
            'setting_value' => '40',
            'setting_type' => 'number',
            'category' => 'Academic',
            'description' => 'Maximum number of students allowed per class',
            'is_public' => false,
        ]);

        SystemSetting::create([
            'setting_key' => 'enable_email_notifications',
            'setting_value' => 'true',
            'setting_type' => 'boolean',
            'category' => 'Notifications',
            'description' => 'Enable or disable email notifications',
            'is_public' => false,
        ]);

        SystemSetting::create([
            'setting_key' => 'academic_year',
            'setting_value' => '2024-2025',
            'setting_type' => 'text',
            'category' => 'Academic',
            'description' => 'Current academic year',
            'is_public' => true,
        ]);

        // Sample Reports
        Report::create([
            'report_name' => 'Academic Report',
            'report_type' => 'students',
            'description' => 'Summary of academic performance',
            'parameters' => [
                'file_type' => 'PDF',
                'file_ext' => 'pdf',
                'file_size_mb' => 2.4,
            ],
            'generated_by' => null,
            'generated_at' => '2024-01-15 00:00:00',
            'status' => 'Generated',
        ]);

        Report::create([
            'report_name' => 'Student Report',
            'report_type' => 'students',
            'description' => 'Detailed student statistics',
            'parameters' => [
                'file_type' => 'PDF',
                'file_ext' => 'pdf',
                'file_size_mb' => 5.1,
            ],
            'generated_by' => null,
            'generated_at' => '2024-01-10 00:00:00',
            'status' => 'Generated',
        ]);

        Report::create([
            'report_name' => 'Faculty Report',
            'report_type' => 'faculty',
            'description' => 'Faculty employment and load overview',
            'parameters' => [
                'file_type' => 'DOCX',
                'file_ext' => 'docx',
                'file_size_mb' => 1.8,
            ],
            'generated_by' => null,
            'generated_at' => '2024-01-08 00:00:00',
            'status' => 'Generated',
        ]);
    }
}
