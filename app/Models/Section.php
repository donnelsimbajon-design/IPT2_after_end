<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $table = 'sections';

    protected $fillable = [
        'course_id',
        'year_level',
        'label',
        'code',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(Offering::class);
    }
}
