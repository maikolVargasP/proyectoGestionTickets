<?php
use App\Repositories\TicketsRepository;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (App $app) {

    $app->group('/tickets', function (RouteCollectorProxy $group) {

        $group->post('/create', [TicketsRepository::class, 'crear'])
            ->add(new RoleMiddleware(['gestor']))
            ->add(new AuthMiddleware());
            
        $group->get('/mine', [TicketsRepository::class, 'misTickets'])
            ->add(new RoleMiddleware(['gestor']))
            ->add(new AuthMiddleware());
            
        $group->get('/all', [TicketsRepository::class, 'todos'])
            ->add(new RoleMiddleware(['admin']))
            ->add(new AuthMiddleware());

        $group->get('/{id}', [TicketsRepository::class, 'ver'])
            ->add(new AuthMiddleware());

        $group->put('/{id}/assign', [TicketsRepository::class, 'asignar'])
            ->add(new RoleMiddleware(['admin']))
            ->add(new AuthMiddleware());
    });
};
