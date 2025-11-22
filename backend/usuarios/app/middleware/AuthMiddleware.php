<?php
namespace App\Middleware;

use App\Models\AuthToken;
use App\Models\Usuario;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        // Leer el encabezado Authorization
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token no proporcionado']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        // Extraer token real
        $token = trim(str_replace('Bearer', '', $authHeader));

        // Buscar token en base de datos
        $tokenData = AuthToken::where('token', $token)->first();

        if (!$tokenData) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token inválido']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        // Obtener usuario dueño del token
        $user = Usuario::find($tokenData->user_id);

        if (!$user) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        // Pasar usuario a la request
        $request = $request->withAttribute('user', $user);

        // Continuar al siguiente middleware o ruta
        return $handler->handle($request);
    }
}
