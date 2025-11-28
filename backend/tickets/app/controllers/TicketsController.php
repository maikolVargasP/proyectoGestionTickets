<?php
namespace App\Controllers;

use App\Models\Ticket;
use App\Models\TicketActividad;

class TicketsController
{
    public function crearTicket($data, $user)
    {
        // Crear ticket
        $ticket = Ticket::create([
            'titulo'      => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'estado'      => 'abierto',
            'gestor_id'   => $user['id'],   
            'admin_id'    => null           
        ]);

        // Registrar actividad inicial
        TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user['id'],
            'mensaje'   => 'Ticket creado'
        ]);

        return $ticket;
    }
    public function obtenerMisTickets($user)
    {
        return Ticket::where('gestor_id', $user['id'])
                    ->with('actividades') // opcional: traer historial
                    ->get();
    }
    public function obtenerTodosLosTickets()
    {
        // Trae todos los tickets con sus relaciones
        return Ticket::with(['actividades', 'gestor', 'admin'])->get();
    }
    public function verTicket($id)
    {
        return Ticket::with(['actividades', 'gestor', 'admin'])->find($id);
    }
    public function asignarTicket($ticketId, $adminId, $adminQueAsigna)
    {
        $ticket = Ticket::find($ticketId);

        if (!$ticket) {
            return null; // ticket no existe
        }

        // Asignar al admin
        $ticket->admin_id = $adminId;
        $ticket->save();

        // Registrar actividad
        TicketActividad::create([
            'ticket_id' => $ticketId,
            'user_id'   => $adminQueAsigna['id'],
            'mensaje'   => "Ticket asignado al administrador ID: {$adminId}"
        ]);

        return $ticket;
    }


}
