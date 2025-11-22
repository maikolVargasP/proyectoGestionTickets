<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'users'; 

    protected $fillable = ['name', 'email', 'password', 'role'];

    public $timestamps = true;
}
