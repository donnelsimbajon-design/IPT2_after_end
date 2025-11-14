<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAvatarAndArchivableToArchivesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('archives', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('notes');
            $table->string('archivable_type')->nullable()->after('avatar_path'); // Student, Faculty, Report
            $table->unsignedBigInteger('archivable_id')->nullable()->after('archivable_type');
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
            $table->dropColumn(['avatar_path', 'archivable_type', 'archivable_id']);
        });
    }
}
