<?php
namespace App\Repositories;

use App\Controllers\TicketsController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TicketsRepository
{
    public function crear(Request $request, Response $response)
    {
        $user = $request->getAttribute('user'); // viene del token
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
    public function asignar(Request $request, Response $response, array $args)
    {
        $ticketId = $args['id'];
        $user = $request->getAttribute('user'); // admin autenticado

        // Obtener datos del body
        $data = $request->getParsedBody();
        if (!isset($data['admin_id'])) {
            $response->getBody()->write(json_encode(['error' => 'Debe enviar admin_id']));
            return $response->withStatus(400);
        }

        $adminId = $data['admin_id'];

        // Validar que el usuario destino sea admin
        $adminDestino = \App\Models\User::find($adminId);
        if (!$adminDestino || $adminDestino->role !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'El usuario destino no es un administrador válido']));
            return $response->withStatus(400);
        }

        // Llamar al controlador
        $controller = new TicketsController();
        $ticket = $controller->asignarTicket($ticketId, $adminId, $user);

        if (!$ticket) {
            $response->getBody()->write(json_encode(['error' => 'Ticket no encontrado']));
            return $response->withStatus(404);
        }

        $response->getBody()->write($ticket->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }


}
