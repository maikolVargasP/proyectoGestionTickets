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
}
