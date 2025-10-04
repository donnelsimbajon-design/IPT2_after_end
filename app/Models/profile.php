<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profiles';

    // allow mass assignment
    protected $fillable = [
        'fname','lname','email','phone','address','city','state','zip','country'
    ];
}