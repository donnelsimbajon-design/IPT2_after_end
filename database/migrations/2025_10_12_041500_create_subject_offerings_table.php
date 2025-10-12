<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subject_offerings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('year_level', 40)->nullable();
            $table->string('course_code', 40)->nullable();
            $table->string('section_label', 40)->nullable();
            $table->string('section_code', 100)->nullable();
            $table->string('subject_code', 100);
            $table->string('subject_description', 255);
            $table->unsignedSmallInteger('lec')->default(0);
            $table->unsignedSmallInteger('lab')->default(0);
            $table->unsignedSmallInteger('units')->default(0);
            $table->string('room', 100)->nullable();
            $table->string('schedule', 255)->nullable();
            $table->timestamps();

            $table->index(['year_level', 'course_code', 'section_label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_offerings');
    }
};
