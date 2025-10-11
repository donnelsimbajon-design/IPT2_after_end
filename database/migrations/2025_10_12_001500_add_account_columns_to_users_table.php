<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'bg_image_path')) {
                $table->string('bg_image_path')->nullable()->after('avatar_path');
            }
            if (!Schema::hasColumn('users', 'theme_mode')) {
                $table->string('theme_mode', 16)->nullable()->after('bg_image_path');
            }
            if (!Schema::hasColumn('users', 'theme_color')) {
                $table->string('theme_color', 20)->nullable()->after('theme_mode');
            }
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 64)->nullable()->after('theme_color');
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('last_login_ip');
            }
            if (!Schema::hasColumn('users', 'last_login_user_agent')) {
                $table->text('last_login_user_agent')->nullable()->after('last_login_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'avatar_path')) {
                $table->dropColumn('avatar_path');
            }
            if (Schema::hasColumn('users', 'bg_image_path')) {
                $table->dropColumn('bg_image_path');
            }
            if (Schema::hasColumn('users', 'theme_mode')) {
                $table->dropColumn('theme_mode');
            }
            if (Schema::hasColumn('users', 'theme_color')) {
                $table->dropColumn('theme_color');
            }
            if (Schema::hasColumn('users', 'last_login_ip')) {
                $table->dropColumn('last_login_ip');
            }
            if (Schema::hasColumn('users', 'last_login_at')) {
                $table->dropColumn('last_login_at');
            }
            if (Schema::hasColumn('users', 'last_login_user_agent')) {
                $table->dropColumn('last_login_user_agent');
            }
        });
    }
};
