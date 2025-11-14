<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('archives', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate archives for the same archivable record
            // This ensures each student/faculty can only have one archive record
            $table->unique(['archivable_type', 'archivable_id'], 'unique_archivable');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('archives', function (Blueprint $table) {
            $table->dropUnique('unique_archivable');
        });
    }
};
