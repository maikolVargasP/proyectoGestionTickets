<?php
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/config/database.php';

$routes = require __DIR__ . '/../app/config/routes.php';

$app = AppFactory::create();

$routes($app);  

$app->run();
?>