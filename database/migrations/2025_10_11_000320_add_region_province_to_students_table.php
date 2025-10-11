<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'region')) {
                $table->string('region')->nullable()->after('address');
            }
            if (!Schema::hasColumn('students', 'province')) {
                $table->string('province')->nullable()->after('region');
            }
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'province')) {
                $table->dropColumn('province');
            }
            if (Schema::hasColumn('students', 'region')) {
                $table->dropColumn('region');
            }
        });
    }
};
