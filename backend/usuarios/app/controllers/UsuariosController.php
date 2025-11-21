<?php
namespace App\Controllers;

use App\Models\Usuario;

class UsuariosController
{
    public function getUsuarios()
    {
        $rows = Usuario::all();

        if ($rows->isEmpty()) {
            return null;
        }

        return $rows->toJson();
    }
}
