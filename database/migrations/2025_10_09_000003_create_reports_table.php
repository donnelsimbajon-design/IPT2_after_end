<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->string('report_type'); // e.g., 'Student', 'Faculty', 'Enrollment', 'Financial'
            $table->text('description')->nullable();
            $table->json('parameters')->nullable(); // Store report parameters as JSON
            $table->foreignId('generated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('generated_at')->nullable();
            $table->string('file_path')->nullable(); // If report is saved as file
            $table->enum('status', ['Pending', 'Generated', 'Failed'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
};
