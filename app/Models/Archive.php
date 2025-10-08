<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $table = 'archives';

    protected $fillable = [
        'archive_id',
        'title',
        'description',
        'document_type',
        'category',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'document_date',
        'archived_date',
        'archived_by',
        'department',
        'reference_number',
        'status',
        'tags',
        'notes',
    ];

    protected $casts = [
        'document_date' => 'date',
        'archived_date' => 'date',
        'file_size' => 'integer',
    ];
}
