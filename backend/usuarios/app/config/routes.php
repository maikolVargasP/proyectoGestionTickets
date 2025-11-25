<?php

use App\Repositories\UsuariosRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (App $app) {

    // Ruta raíz del microservicio
    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write("Hello usuarios!");
        return $response;
    });

    $app->group('/usuarios', function (RouteCollectorProxy $group) {

        // ---- RUTAS ESTÁTICAS (van primero) ----

        $group->get('/all', [UsuariosRepository::class, 'queryAllUsuarios'])
            ->add(new RoleMiddleware(['admin']))
            ->add(new AuthMiddleware());

        $group->post('/register', [UsuariosRepository::class, 'registrarUsuario']);
        $group->post('/login', [UsuariosRepository::class, 'login']);

        $group->get('/profile', [UsuariosRepository::class, 'miPerfil'])
            ->add(new AuthMiddleware());

        $group->post('/logout', [UsuariosRepository::class, 'logout'])
            ->add(new AuthMiddleware());

        $group->get('/validate-token', [UsuariosRepository::class, 'validarToken'])
            ->add(new AuthMiddleware());

        // ---- RUTAS DINÁMICAS (van SIEMPRE al final) ----

        // Nota: puedes agregar restricción numérica si quieres:
        // '/{id:[0-9]+}'

        $group->get('/{id}', [UsuariosRepository::class, 'obtenerUsuario'])
            ->add(new AuthMiddleware())
            ->add(new RoleMiddleware(['admin']));

        $group->put('/{id}', [UsuariosRepository::class, 'actualizarUsuario'])
            ->add(new AuthMiddleware())
            ->add(new RoleMiddleware(['admin']));

        $group->delete('/{id}', [UsuariosRepository::class, 'eliminarUsuario'])
            ->add(new AuthMiddleware())
            ->add(new RoleMiddleware(['admin']));

    });
};
