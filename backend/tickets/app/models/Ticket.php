<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $table = 'tickets';

    protected $fillable = [
        'titulo',
        'descripcion',
        'estado',
        'gestor_id',
        'admin_id'
    ];

    public $timestamps = true; 

    // Un ticket tiene muchas actividades (comentarios / historial)
    public function actividades()
    {
        return $this->hasMany(TicketActividad::class, 'ticket_id');
    }

    // Relación con el creador (gestor)
    public function creador()
    {
        return $this->belongsTo(User::class, 'gestor_id');
    }

    // Relación con administrador asignado
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
