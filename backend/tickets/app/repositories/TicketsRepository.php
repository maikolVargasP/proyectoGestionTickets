<?php
namespace App\Repositories;

use App\Controllers\TicketsController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Ticket;
use App\Models\TicketActividad;
use App\Models\User;

class TicketsRepository
{
    // Crear un nuevo ticket
    public function crear(Request $request, Response $response)
    {
        $user = $request->getAttribute('user'); 
        $data = $request->getParsedBody();

        // Validación básica
        if (!isset($data['titulo']) || !isset($data['descripcion'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan datos']));
            return $response->withStatus(400);
        }

        $controller = new TicketsController();
        $ticket = $controller->crearTicket($data, $user);

        $response->getBody()->write($ticket->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
    // Obtener tickets del gestor autenticado
    public function misTickets(Request $request, Response $response)
    {
        $user = $request->getAttribute('user'); // gestor autenticado

        $controller = new TicketsController();
        $tickets = $controller->obtenerMisTickets($user);

        if ($tickets->isEmpty()) {
            return $response->withStatus(204); // No Content
        }

        $response->getBody()->write($tickets->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
    // Obtener todos los tickets (solo admin)
    public function todos(Request $request, Response $response)
    {
        $controller = new TicketsController();
        $tickets = $controller->obtenerTodosLosTickets();

        if ($tickets->isEmpty()) {
            return $response->withStatus(204);
        }

        $response->getBody()->write($tickets->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
    // Ver un ticket por ID
    public function ver(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        $user = $request->getAttribute('user');

        $controller = new TicketsController();
        $ticket = $controller->verTicket($id);

        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404)->withHeader("Content-Type", "application/json");
        }

        // Si es gestor, solo puede ver tickets propios
        if ($user->role === 'gestor' && $ticket->gestor_id !== $user->id) {
            $response->getBody()->write(json_encode(['error' => 'No puedes ver este ticket']));
            return $response->withStatus(403)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write($ticket->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
    // Asignar ticket a un administrador
    public function asignar(Request $request, Response $response, array $args)
    {
        $ticketId = $args['id'];
        $data = $request->getParsedBody();
        $adminQueAsigna = $request->getAttribute('user'); // admin autenticado

        // Validar parámetro
        if (!isset($data['admin_id'])) {
            $response->getBody()->write(json_encode(['error' => 'Debe enviar admin_id']));
            return $response->withStatus(400);
        }

        $adminId = $data['admin_id'];

        // Buscar ticket
        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404);
        }

        // Buscar el administrador a asignar
        $admin = User::find($adminId);
        if (!$admin) {
            $response->getBody()->write(json_encode(['error' => 'Administrador no encontrado']));
            return $response->withStatus(404);
        }

        // Validar rol del admin asignado
        if ($admin->role !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'El usuario a asignar NO es un administrador']));
            return $response->withStatus(400);
        }

        // Validar si ya está asignado a ese admin
        if ($ticket->admin_id === $adminId) {
            $response->getBody()->write(json_encode(['info' => 'El ticket ya está asignado a este administrador']));
            return $response->withStatus(200);
        }

        // Asignación
        $ticket->admin_id = $adminId;
        $ticket->save();

        // Registrar actividad
        TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $adminQueAsigna->id,
            'mensaje'   => "Ticket asignado al administrador ID: {$adminId}"
        ]);

        $response->getBody()->write($ticket->toJson());
        return $response->withHeader('Content-Type', 'application/json');
    }
    // Cambiar estado del ticket
    public function cambiarEstado(Request $request, Response $response, array $args)
    {
        error_log("Entró al método cambiarEstado");

        $ticketId = $args['id'];
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user'); // admin autenticado

        if (!isset($data['estado'])) {
            $response->getBody()->write(json_encode(['error' => 'Debe enviar un estado']));
            return $response->withStatus(400);
        }

        $nuevoEstado = $data['estado'];

        $estadosValidos = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];

        if (!in_array($nuevoEstado, $estadosValidos)) {
            $response->getBody()->write(json_encode(['error' => 'Estado no válido']));
            return $response->withStatus(400);
        }

        $ticket = Ticket::find($ticketId);

        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404);
        }

        // Si el estado es el mismo, no hacemos nada
        if ($ticket->estado === $nuevoEstado) {
            $response->getBody()->write(json_encode(['info' => 'El ticket ya está en ese estado']));
            return $response->withStatus(200);
        }

        // Actualizar estado
        $ticket->estado = $nuevoEstado;
        $ticket->admin_id = $user->id; // Registrar admin que intervino
        $ticket->save();

        // Registrar actividad
        TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user->id,
            'mensaje'   => "Estado cambiado a: $nuevoEstado"
        ]);

        $response->getBody()->write($ticket->toJson());
        return $response->withHeader('Content-Type', 'application/json');
    }
    // Obtener actividades de un ticket
    public function actividades(Request $request, Response $response, array $args)
    {
        $ticketId = $args['id'];

        // Verificar existencia del ticket
        $ticket = Ticket::find($ticketId);

        if (!$ticket) {
            $response->getBody()->write(json_encode([
                'error' => 'Ticket no encontrado'
            ]));
            return $response->withStatus(404);
        }

        // Obtener actividades con usuario
        $actividades = TicketActividad::where('ticket_id', $ticketId)
            ->orderBy('created_at', 'ASC')
            ->get();

        $response->getBody()->write($actividades->toJson());
        return $response->withHeader('Content-Type', 'application/json');
    }
    public function agregarComentario(Request $request, Response $response, array $args)
    {
        $ticketId = $args['id'];
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user'); // admin o gestor autenticado

        // Validar mensaje
        if (!isset($data['mensaje']) || trim($data['mensaje']) === '') {
            $response->getBody()->write(json_encode(['error' => 'Debe enviar un mensaje']));
            return $response->withStatus(400);
        }

        // Buscar ticket
        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404);
        }

        // Si es gestor, solo puede comentar en SUS PROPIOS TICKETS
        if ($user->role === 'gestor' && $ticket->gestor_id !== $user->id) {
            $response->getBody()->write(json_encode([
                'error' => 'No puedes comentar en tickets que no has creado'
            ]));
            return $response->withStatus(403);
        }

        // Crear comentario (actividad)
        $actividad = TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user->id,
            'mensaje'   => $data['mensaje']
        ]);

        $response->getBody()->write($actividad->toJson());
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function agregarActividad(Request $request, Response $response, array $args)
    {
        $ticketId = $args['id'];
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user');

        if (!isset($data['mensaje']) || trim($data['mensaje']) === '') {
            $response->getBody()->write(json_encode(['error' => 'Debe enviar un mensaje']));
            return $response->withStatus(400);
        }

        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404);
        }

        $actividad = TicketActividad::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user->id,
            'mensaje'   => $data['mensaje']
        ]);

        $response->getBody()->write($actividad->toJson());
        return $response->withHeader('Content-Type', 'application/json');
    }
    public function buscar(Request $request, Response $response)
    {
        $user = $request->getAttribute('user');

        // Leer parámetros GET
        $params = $request->getQueryParams();

        $estado = $params['estado'] ?? null;
        $gestorId = $params['gestor_id'] ?? null;
        $adminId = $params['admin_id'] ?? null;

        // Construcción dinámica de query
        $query = Ticket::query();

        // Si es gestor → solo puede buscar SUS tickets
        if ($user->role === 'gestor') {
            $query->where('gestor_id', $user->id);
        }

        // Si se envía estado
        if ($estado) {
            $query->where('estado', $estado);
        }

        // Si se envía gestor_id (solo ADMIN lo puede usar)
        if ($gestorId && $user->role === 'admin') {
            $query->where('gestor_id', $gestorId);
        }

        // Si se envía admin_id (solo ADMIN lo puede usar)
        if ($adminId && $user->role === 'admin') {
            $query->where('admin_id', $adminId);
        }

        // Cargar relaciones
        $tickets = $query->with(['gestor', 'admin', 'actividades'])
                        ->orderBy('created_at', 'DESC')
                        ->get();

        if ($tickets->isEmpty()) {
            return $response->withStatus(204); // No Content
        }

        $response->getBody()->write($tickets->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
}
