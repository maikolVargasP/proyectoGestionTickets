<?php
use Slim\Factory\AppFactory;
use Psr\Http\Message\ServerRequestInterface as Request;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/config/database.php';

$app = AppFactory::create();

// Body parser
$app->addBodyParsingMiddleware();

// ---------- CORS ----------

$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

$app->add(function (Request $request, $handler) {

    $origin = $request->getHeaderLine('Origin') ?: '*';

    $response = $handler->handle($request);

    $response = $response
        ->withHeader('Access-Control-Allow-Origin', $origin)
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');

    if ($request->getMethod() === 'OPTIONS') {
        return $response->withStatus(200);
    }

    return $response;
});

$routes = require __DIR__ . '/../app/config/routes.php';
$routes($app);

$app->run();
