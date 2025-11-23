<?php
namespace App\Controllers;

use App\Models\Ticket;
use App\Models\TicketActividad;

class TicketsController
{
    // Crear un ticket
    public function crearTicket($data, $user)
    {
        // Crear ticket
        $ticket = Ticket::create([
            'titulo'      => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'estado'      => 'abierto',
            'gestor_id'   => $user['id'],   // gestor autenticado
            'admin_id'    => null           // aún sin asignar
        ]);

        // Registrar actividad inicial
        TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user['id'],
            'mensaje'   => 'Ticket creado'
        ]);

        return $ticket;
    }
}
