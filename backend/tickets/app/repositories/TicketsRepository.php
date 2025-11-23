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
}
