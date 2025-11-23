<?php
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/config/database.php';

$app = AppFactory::create();


$app->addBodyParsingMiddleware();


$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
});

$routes = require __DIR__ . '/../app/config/routes.php';
$routes($app);

$app->run();
