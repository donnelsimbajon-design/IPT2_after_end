<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Offering;

class ExampleOfferingsSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure CSP department and BSIT course exist
        $dept = Department::firstOrCreate(
            ['code' => 'CSP'],
            ['name' => 'COMPUTER SCIENCE PROGRAM', 'status' => 'Active']
        );

        $course = Course::firstOrCreate(
            ['code' => 'BSIT'],
            ['name' => 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY', 'department_id' => $dept->id, 'status' => 'Active']
        );

        // Helper to create/find section by year and label
        $mkSection = function (string $year, string $label) use ($course): Section {
            $num = '1';
            if (stripos($year, 'SECOND') !== false) $num = '2';
            elseif (stripos($year, 'THIRD') !== false) $num = '3';
            elseif (stripos($year, 'FOURTH') !== false) $num = '4';
            $code = $course->code . ' ' . $num . '-' . $label;
            return Section::firstOrCreate(
                ['code' => $code],
                ['course_id' => $course->id, 'year_level' => $year, 'label' => $label]
            );
        };

        // Helper to create/find subject
        $mkSubject = function (string $code, string $desc) use ($dept): Subject {
            return Subject::firstOrCreate(
                ['code' => $code],
                ['description' => $desc, 'department_id' => $dept->id, 'lec_default' => 0, 'lab_default' => 0, 'unit_default' => 0]
            );
        };

        // Helper to create offering uniquely (section + subject uniqueness)
        $mkOffering = function (Section $section, Subject $subject, int $lec, int $lab, int $units, ?string $room, ?string $sched) {
            Offering::firstOrCreate(
                ['section_id' => $section->id, 'subject_id' => $subject->id],
                ['lec' => $lec, 'lab' => $lab, 'units' => $units, 'room' => $room, 'schedule' => $sched]
            );
        };

        // Year 1
        $sec1 = $mkSection('FIRST YEAR', 'IT11');
        $mkOffering($sec1, $mkSubject('BRIDG 001', 'Bridging Subject 1 (Algebra, Trigo, Calculus 1)'), 3, 0, 3, null, 'T/F 03:00PM-04:30PM/03:00PM-04:30PM');
        $mkOffering($sec1, $mkSubject('IT 170', 'Computer Fundamentals and Operations'), 2, 3, 3, null, 'M/TH 09:00AM-11:30AM/09:00AM-11:30AM');
        $mkOffering($sec1, $mkSubject('GE 104', 'Mathematics in the Modern World'), 3, 0, 3, null, 'M/TH 04:30PM-06:00PM/04:30PM-06:00PM');

        // Year 2
        $sec2 = $mkSection('SECOND YEAR', 'IT21');
        $mkOffering($sec2, $mkSubject('IT 272', 'Data Structures & Algorithms'), 2, 1, 3, null, 'T/F 12:30PM-03:00PM/12:30PM-03:00PM');
        $mkOffering($sec2, $mkSubject('IT 270-EL1', 'Object Oriented Programming'), 2, 1, 3, null, 'M/TH 03:00PM-05:30PM/03:00PM-05:30PM');
        $mkOffering($sec2, $mkSubject('GE 116', 'Panitikang Pilipino'), 3, 0, 3, null, 'M/TH 01:30PM-03:00PM/01:30PM-03:00PM');

        // Year 3
        $sec3 = $mkSection('THIRD YEAR', 'IT31');
        $mkOffering($sec3, $mkSubject('IT 370', 'Advance Networking'), 2, 1, 3, null, 'T/F 09:00AM-11:30AM/09:00AM-11:30AM');
        $mkOffering($sec3, $mkSubject('IT 372', 'Information Assurance and Security 1'), 3, 0, 3, null, 'T/F 04:30PM-06:00PM/04:30PM-06:00PM');
        $mkOffering($sec3, $mkSubject('IT 374-EL3', 'Integrative Programming and Technologies 2'), 2, 1, 3, null, 'M/TH 09:00AM-11:30AM/09:00AM-11:30AM');

        // Year 4
        $sec4 = $mkSection('FOURTH YEAR', 'IT41');
        $mkOffering($sec4, $mkSubject('IT 473-EL6', 'Human Computer Interaction 2'), 3, 0, 3, null, 'M/TH 01:30PM-03:00PM/01:30PM-03:00PM');
        $mkOffering($sec4, $mkSubject('IT 471', 'Information Assurance and Security 2'), 2, 3, 3, null, 'M/TH 04:30PM-06:00PM/04:30PM-06:00PM');
        $mkOffering($sec4, $mkSubject('IT 470', 'Research (Capstone Project 2)'), 3, 0, 3, null, 'T/F 01:30PM-03:00PM/01:30PM-03:00PM');
    }
}
