<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArchivesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            $table->string('archive_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('document_type')->nullable(); // e.g., 'Report', 'Record', 'Document'
            $table->string('category')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->date('document_date')->nullable();
            $table->date('archived_date')->nullable();
            $table->string('archived_by')->nullable();
            $table->string('department')->nullable();
            $table->string('reference_number')->nullable();
            $table->enum('status', ['Active', 'Archived', 'Deleted'])->default('Active');
            $table->text('tags')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('archives');
    }
}
