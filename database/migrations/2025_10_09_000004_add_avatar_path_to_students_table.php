<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'avatar_path')) {
                $table->dropColumn('avatar_path');
            }
        });
    }
};
