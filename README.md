# proyectoGestionTickets
Este proyecto consiste en el desarrollo completo de un Sistema Web de Gestión de Tickets de Soporte, diseñado para administrar incidentes, solicitudes y el flujo de atención entre usuarios gestores y administradores. El objetivo principal es ofrecer una plataforma sencilla, segura y escalable que permita gestionar tickets desde su creación hasta su cierre, manteniendo un historial detallado de actividades.

La aplicación está construida sobre una arquitectura de microservicios dividida en dos módulos principales:

Microservicio de Usuarios: encargado del registro, autenticación, roles, sesiones y administración de cuentas.

Microservicio de Tickets: responsable de la creación, asignación, seguimiento, filtrado y resolución de tickets, además del historial de comentarios.

El frontend se implementa exclusivamente con HTML5, CSS y JavaScript puro, mientras que los microservicios del backend utilizan PHP, Slim Framework y Eloquent ORM para la gestión de datos en una base de datos relacional.

El sistema implementa autenticación basada en tokens, validación de sesiones y control de acceso por roles, asegurando que tanto gestores como administradores solo puedan acceder a las funcionalidades que les corresponden.

# Funcionalidades principales
# Gestión de usuarios

- ✅ Registro e inicio de sesión con generación de token.
- ✅ Roles: gestor y administrador.
- ✅ Administración de usuarios: listar, editar, cambiar rol y desactivar.

# Manejo de sesiones

- ✅ Token almacenado en localStorage o sessionStorage.
- ✅ Validación de token en todos los endpoints protegidos.
- ✅ Cierre de sesión eliminando el token.

# Gestión de tickets

- ✅ Los gestores pueden crear tickets, ver los suyos y comentar.
- ✅ Los administradores pueden ver todos los tickets, actualizarlos, asignarlos y comentar.
- ✅ Historial de actividades y comentarios.
- ✅ Búsqueda y filtrado por estado, creador o asignación.

# Frontend

- ✅ Interfaz diferenciada para gestores y administradores.
- ✅ Manipulación dinámica del DOM.
- ✅ Consumo de APIs mediante fetch.
- ✅ Diseño con Flexbox y Grid.

# Tecnologías utilizadas
- ✅ Backend
- ✅ PHP 8+
- ✅ Slim Framework
- ✅ Eloquent ORM
- ✅ MySQL / MariaDB
- ✅ Microservicios independientes
- ✅ HTML5 semántico
- ✅ CSS externo
- ✅ JavaScript ES6+
- ✅ Uso de fetch, promesas y almacenamiento local

# Base de datos

Importa el archivo `soporte_tickets.sql` en tu servidor MySQL.
