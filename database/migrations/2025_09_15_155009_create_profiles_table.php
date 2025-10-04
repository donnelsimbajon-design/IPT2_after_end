<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (! Schema::hasTable('profiles')) {
            Schema::create('profiles', function (Blueprint $table) {
                $table->id();
                $table->string('fname');
                $table->string('lname')->nullable();
                $table->string('email')->nullable()->unique();
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('zip')->nullable();
                $table->string('country')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('profiles');
    }
};