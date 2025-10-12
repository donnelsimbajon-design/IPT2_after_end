<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectOffering extends Model
{
    protected $table = 'subject_offerings';

    protected $fillable = [
        'year_level',
        'course_code',
        'section_label',
        'section_code',
        'subject_code',
        'subject_description',
        'lec',
        'lab',
        'units',
        'room',
        'schedule',
    ];
}
