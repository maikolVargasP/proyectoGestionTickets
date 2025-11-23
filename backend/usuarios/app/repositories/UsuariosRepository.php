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
    public function login(Request $request, Response $response)
    {
        $body = $request->getParsedBody();
        $controller = new UsuariosController();
        $result = $controller->login($body);

        if (isset($result['error'])) {
            $response->getBody()->write(json_encode(['error' => $result['error']]));
            return $response
                ->withStatus($result['status'])
                ->withHeader('Content-Type', 'application/json');
        }
        $response->getBody()->write(json_encode($result));
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }
    public function miPerfil(Request $request, Response $response)
    {
        // El AuthMiddleware ya dejó los datos del usuario en los atributos
        $user = $request->getAttribute('user');
        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no autenticado']));
            return $response->withStatus(401)->withHeader("Content-Type", "application/json");
        }
        $controller = new UsuariosController();
        $data = $controller->getProfile($user);
        $response->getBody()->write(json_encode($data));
        return $response->withHeader("Content-Type", "application/json");
    }
    public function obtenerUsuario(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        $userToken = $request->getAttribute('user');
        // - Admin puede consultar cualquier usuario
        if ($userToken['role'] !== 'admin') {
            $response->getBody()->write(json_encode([
                'error' => 'No tienes permiso para ver este usuario'
            ]));    
            return $response->withStatus(403)->withHeader("Content-Type", "application/json");
        }

        $controller = new UsuariosController();
        $user = $controller->getUsuarioById($id);

        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write($user->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }

    public function actualizarUsuario(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        $userToken = $request->getAttribute('user');
        // Validar permisos: admin puede todo
        if ($userToken['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Solo el administrador puede modificar usuarios']));
            return $response->withStatus(403)->withHeader("Content-Type", "application/json");
        }
        $data = $request->getParsedBody();
        $controller = new UsuariosController();
        $updated = $controller->actualizarUsuario($id, $data);
        if (!$updated) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader("Content-Type", "application/json");
        }
        $response->getBody()->write($updated->toJson());
        return $response->withHeader("Content-Type", "application/json");
    }
    public function eliminarUsuario(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        $userToken = $request->getAttribute('user');
        if ($userToken['role'] !== 'admin') {
            $response->getBody()->write(json_encode([
                'error' => 'Solo el administrador puede eliminar usuarios'
            ]));
            return $response->withStatus(403)->withHeader("Content-Type", "application/json");
        }
        $controller = new UsuariosController();
        $deleted = $controller->eliminarUsuario($id);
        if (!$deleted) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader("Content-Type", "application/json");
        }
        $response->getBody()->write(json_encode(['message' => 'Usuario eliminado correctamente']));
        return $response->withHeader("Content-Type", "application/json");
    }
    public function logout(Request $request, Response $response)
    {
        $response->getBody()->write(json_encode([
            'message' => 'Sesión cerrada correctamente. Eliminé el token en el frontend.'
        ]));
        return $response->withHeader("Content-Type", "application/json");
    }
    public function validarToken(Request $request, Response $response)
    {
        $user = $request->getAttribute('user');

        if (!$user) {
            $response->getBody()->write(json_encode([
                'valid' => false,
                'error' => 'Token inválido'
            ]));
            return $response->withStatus(401)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write(json_encode([
            'valid' => true,
            'user' => $user
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }
}
