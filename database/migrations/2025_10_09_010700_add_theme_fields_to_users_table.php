<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'theme_color')) {
                $table->string('theme_color', 12)->nullable()->after('last_login_at');
            }
            if (!Schema::hasColumn('users', 'theme_mode')) {
                $table->string('theme_mode', 12)->nullable()->after('theme_color'); // 'light' or 'dark'
            }
            if (!Schema::hasColumn('users', 'bg_image_path')) {
                $table->string('bg_image_path')->nullable()->after('theme_mode');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'theme_color')) {
                $table->dropColumn('theme_color');
            }
            if (Schema::hasColumn('users', 'theme_mode')) {
                $table->dropColumn('theme_mode');
            }
            if (Schema::hasColumn('users', 'bg_image_path')) {
                $table->dropColumn('bg_image_path');
            }
        });
    }
};
