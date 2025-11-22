<?php
namespace App\Repositories;

use App\Controllers\UsuariosController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UsuariosRepository
{
    public function queryAllUsuarios(Request $request, Response $response)
    {
        $controller = new UsuariosController();
        $data = $controller->getUsuarios();

        if ($data === null) {
            return $response->withStatus(204);
        }

        $response->getBody()->write($data);
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function registrarUsuario(Request $request, Response $response)
    {
        $body = $request->getParsedBody();
        $controller = new UsuariosController();

        $result = $controller->registrarUsuario($body);

        if (isset($result['error'])) {
            $response->getBody()->write(json_encode(['error' => $result['error']]));
            return $response->withStatus($result['status'])
                            ->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($result));
        return $response->withStatus(201)
                        ->withHeader('Content-Type', 'application/json');
    }
}
