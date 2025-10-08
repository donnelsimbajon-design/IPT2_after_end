<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'Archived' to enum values without requiring doctrine/dbal
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('Active','Inactive','Graduated','Suspended','Archived') DEFAULT 'Active'");
        DB::statement("ALTER TABLE faculties MODIFY COLUMN status ENUM('Active','Inactive','On Leave','Archived') DEFAULT 'Active'");
    }

    public function down(): void
    {
        // Revert to previous enum values
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('Active','Inactive','Graduated','Suspended') DEFAULT 'Active'");
        DB::statement("ALTER TABLE faculties MODIFY COLUMN status ENUM('Active','Inactive','On Leave') DEFAULT 'Active'");
    }
};
