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

    public $timestamps = true; // porque tienes created_at y updated_at

    // Relación con historial / actividades
    public function actividades()
    {
        return $this->hasMany(TicketActividad::class, 'ticket_id');
    }

    // Gestor creador del ticket
    public function gestor()
    {
        return $this->belongsTo(User::class, 'gestor_id');
    }

    // Administrador asignado
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
