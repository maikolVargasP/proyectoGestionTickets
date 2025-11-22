<?php
namespace App\Controllers;
use App\Models\AuthToken;
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
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        // Crear usuario
        $user = Usuario::create($data);
        return [
            'message' => 'Usuario registrado correctamente.',
            'user' => $user,
            'status' => 201
        ];
    }
    public function login($data)
    {
        if (empty($data['email']) || empty($data['password'])) {
            return ['error' => 'Email y password son obligatorios.', 'status' => 400];
        }
        // Buscar usuario por email
        $user = Usuario::where('email', $data['email'])->first();
        if (!$user) {
            return ['error' => 'El email no está registrado.', 'status' => 404];
        }
        // Verificar contraseña
        if (!password_verify($data['password'], $user->password)) {
            return ['error' => 'Contraseña incorrecta.', 'status' => 401];
        }
        // Generar token aleatorio
        $token = bin2hex(random_bytes(32)); // 64 caracteres
        // Guardar token en tabla auth_tokens
        AuthToken::create([
            'user_id' => $user->id,
            'token'   => $token
        ]);
        return [
            'message' => 'Login exitoso.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role
            ],
            'status' => 200
        ];
    }
}
