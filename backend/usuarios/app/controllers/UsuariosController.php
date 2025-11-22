<?php
namespace App\Controllers;

use App\Models\Usuario;

class UsuariosController
{
    public function getUsuarios()
    {
        $rows = Usuario::all();
        return $rows->isEmpty() ? null : $rows->toJson();
    }

    public function registrarUsuario($data)
    {
        // Validar campos obligatorios
        if (
            empty($data['name']) ||
            empty($data['email']) ||
            empty($data['password']) ||
            empty($data['role'])
        ) {
            return ['error' => 'Todos los campos son obligatorios.', 'status' => 400];
        }

        // Validar existencia de email
        if (Usuario::where('email', $data['email'])->exists()) {
            return ['error' => 'El email ya está registrado.', 'status' => 409];
        }

        // Hashear contraseña
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);

        // Crear usuario
        $user = Usuario::create($data);

        return [
            'message' => 'Usuario registrado correctamente.',
            'user' => $user,
            'status' => 201
        ];
    }
}
