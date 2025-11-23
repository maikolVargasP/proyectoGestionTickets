<?php
namespace App\Middleware;

use App\Models\AuthToken;
use App\Models\User;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token no proporcionado']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        $token = trim(str_replace('Bearer', '', $authHeader));

        $tokenData = AuthToken::where('token', $token)->first();
        if (!$tokenData) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token inválido']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        $user = User::find($tokenData->user_id);
        if (!$user) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(401)
                            ->withHeader('Content-Type', 'application/json');
        }

        $request = $request->withAttribute('user', $user);

        return $handler->handle($request);
    }
}
