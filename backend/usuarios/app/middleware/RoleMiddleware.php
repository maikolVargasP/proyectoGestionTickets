<?php
namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response as SlimResponse;

class RoleMiddleware implements MiddlewareInterface
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        // Debe venir del AuthMiddleware
        $user = $request->getAttribute('user');

        if (!$user) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode([
                'error' => 'Usuario no autenticado'
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Validar roles
        if (!in_array($user['role'], $this->allowedRoles)) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode([
                'error' => 'Acceso denegado. Rol requerido: ' . implode(', ', $this->allowedRoles)
            ]));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}
