<?php
use App\Repositories\UsuariosRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

return function (App $app) {

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write("Hello usuarios!");
        return $response;
    });

    $app->group('/usuarios', function (RouteCollectorProxy $group) {
        $group->get('/all', [UsuariosRepository::class, 'queryAllUsuarios']);
        $group->post('/register', [UsuariosRepository::class, 'registrarUsuario']);
        $group->post('/login', [UsuariosRepository::class, 'login']);
    });
};
