<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $table = 'students';

    protected $fillable = [
        'student_id',
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
        'enrollment_date',
        'program',
        'year_level',
        'status',
        'avatar_path',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'enrollment_date' => 'date',
    ];
}
