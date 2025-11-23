<?php
use App\Repositories\TicketsRepository;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (App $app) {

    $app->group('/tickets', function (RouteCollectorProxy $group) {

        // Crear ticket (solo GESTOR)
        $group->post('/create', [TicketsRepository::class, 'crear'])
              ->add(new RoleMiddleware(['gestor']))
              ->add(new AuthMiddleware());

    });

};
