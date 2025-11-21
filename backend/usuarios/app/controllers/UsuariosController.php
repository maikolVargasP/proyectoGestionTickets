<?php
namespace App\Models;


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