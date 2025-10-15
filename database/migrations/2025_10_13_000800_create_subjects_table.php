<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->string('code', 50)->unique();
            $table->string('description');
            $table->unsignedSmallInteger('lec_default')->default(0);
            $table->unsignedSmallInteger('lab_default')->default(0);
            $table->unsignedSmallInteger('unit_default')->default(0);
            $table->string('status')->default('Active');
            $table->timestamps();

            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
