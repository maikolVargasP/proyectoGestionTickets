<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $fillable = ['nombre', 'email', 'password', 'role'];

    public $timestamps = false;
}
