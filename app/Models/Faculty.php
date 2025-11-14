<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Faculty extends Model
{
    protected $table = 'faculties';

    protected $fillable = [
        'faculty_id',
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'department',
        'position',
        'specialization',
        'hire_date',
        'employment_type',
        'status',
        'semester_id',
        'avatar_path',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
    ];

    /**
     * The semester this faculty is assigned to.
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * School years this faculty is assigned to.
     */
    public function schoolYears(): BelongsToMany
    {
        return $this->belongsToMany(SchoolYear::class, 'faculty_school_years')->withTimestamps();
    }
}
