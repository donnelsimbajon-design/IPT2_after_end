<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $table = 'archives';

    protected $fillable = [
        'archive_id',
        'document_number',
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
        'avatar_path',
        'archivable_type',
        'archivable_id',
    ];

    protected $casts = [
        'document_date' => 'date',
        'archived_date' => 'date',
        'file_size' => 'integer',
    ];

    /**
     * Get the archivable model (Student, Faculty, etc.)
     */
    public function archivable()
    {
        return $this->morphTo();
    }

    /**
     * Get the student if this archive is for a student
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'archivable_id')->where('archivable_type', 'App\\Models\\Student');
    }

    /**
     * Get the faculty if this archive is for a faculty
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'archivable_id')->where('archivable_type', 'App\\Models\\Faculty');
    }

    /**
     * Generate a unique document number
     * Format: DOC-YYYY-####
     */
    public static function generateDocumentNumber()
    {
        $year = date('Y');
        $prefix = "DOC-{$year}-";
        
        // Get the latest document number for this year
        $latestArchive = self::where('document_number', 'LIKE', "{$prefix}%")
            ->orderBy('document_number', 'desc')
            ->first();
        
        if ($latestArchive) {
            // Extract the number part and increment
            $lastNumber = intval(substr($latestArchive->document_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate a unique reference number
     * Format: REF-YYYY-####
     */
    public static function generateReferenceNumber()
    {
        $year = date('Y');
        $prefix = "REF-{$year}-";
        
        // Get the latest reference number for this year
        $latestArchive = self::where('reference_number', 'LIKE', "{$prefix}%")
            ->orderBy('reference_number', 'desc')
            ->first();
        
        if ($latestArchive) {
            // Extract the number part and increment
            $lastNumber = intval(substr($latestArchive->reference_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
