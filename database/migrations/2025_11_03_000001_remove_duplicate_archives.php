<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Remove duplicate archive records, keeping only the most recent one for each student/faculty
        
        // For Students
        $duplicateStudents = DB::table('archives')
            ->select('archivable_id', DB::raw('COUNT(*) as count'))
            ->where('archivable_type', 'App\\Models\\Student')
            ->groupBy('archivable_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicateStudents as $duplicate) {
            // Get all records for this student
            $records = DB::table('archives')
                ->where('archivable_type', 'App\\Models\\Student')
                ->where('archivable_id', $duplicate->archivable_id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the first (most recent) record, delete the rest
            $keepId = $records->first()->id;
            
            DB::table('archives')
                ->where('archivable_type', 'App\\Models\\Student')
                ->where('archivable_id', $duplicate->archivable_id)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        // For Faculty
        $duplicateFaculty = DB::table('archives')
            ->select('archivable_id', DB::raw('COUNT(*) as count'))
            ->where('archivable_type', 'App\\Models\\Faculty')
            ->groupBy('archivable_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicateFaculty as $duplicate) {
            // Get all records for this faculty
            $records = DB::table('archives')
                ->where('archivable_type', 'App\\Models\\Faculty')
                ->where('archivable_id', $duplicate->archivable_id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the first (most recent) record, delete the rest
            $keepId = $records->first()->id;
            
            DB::table('archives')
                ->where('archivable_type', 'App\\Models\\Faculty')
                ->where('archivable_id', $duplicate->archivable_id)
                ->where('id', '!=', $keepId)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Cannot reverse deletion of duplicates
    }
};
