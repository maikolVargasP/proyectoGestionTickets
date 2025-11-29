const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    window.location.href = "login.html";
}

const API = "http://127.0.0.1:8000/usuarios";

// Ir al dashboard
function volverDashboard() {
    window.location.href = "dashboard_admin.html";
}

//======================== CARGAR LISTA ========================//

let usuarios = [];

async function cargarUsuarios() {
    try {
        const res = await fetch(`${API}/all`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) {
            console.error("Error al cargar usuarios:", res.status);
            return;
        }

        usuarios = await res.json();
        mostrarTabla(usuarios);
    } catch (error) {
        console.error("Error de red:", error);
    }
}
function mostrarTabla(lista) {
    const tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = "";
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No hay usuarios registrados</td></tr>`;
        return;
    }
    lista.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.active ? "Activo" : "Inactivo"}</td>
                <td>
                    <button onclick="abrirModalEditar(${u.id})" class="btnEditar"><img src="public/edit.svg" alt="editar"></button>
                    <button onclick="eliminarUsuario(${u.id})" class="btnDanger"><img src="public/delete.svg" alt="eliminar"></button>
                </td>
            </tr>
        `;
    });
}

cargarUsuarios();

//======================== BUSCADOR ========================//

document.getElementById("searchUser").addEventListener("input", function () {
    const q = this.value.toLowerCase();

    const filtrados = usuarios.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );

    mostrarTabla(filtrados);
});

//======================== MODAL ========================//

const modal = document.getElementById("modalCrear");

document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
    // Limpiar campos
    document.getElementById("newNombre").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRol").value = "gestor";
    document.getElementById("msgCrear").textContent = "";
    modal.style.display = "flex";
});

function cerrarModal() {
    modal.style.display = "none";
}

//======================== CREAR USUARIO ========================//

document.getElementById("btnGuardarNuevo").addEventListener("click", async () => {
    const nombre = document.getElementById("newNombre").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const rol = document.getElementById("newRol").value;
    const msg = document.getElementById("msgCrear");

    if (!nombre || !email || !password) {
        msg.textContent = "Todos los campos son obligatorios";
        msg.style.color = "red";
        return;
    }
    if (password.length < 6) {
        msg.textContent = "La contraseña debe tener al menos 6 caracteres";
        msg.style.color = "red";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        msg.textContent = "Email inválido";
        msg.style.color = "red";
        return;
    }

    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            name: nombre,
            email,
            password,
            role: rol
        })
    });

    if (!res.ok) {
        const err = await res.json();
        msg.textContent = err.error || "Error al crear usuario";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Usuario creado exitosamente";
    msg.style.color = "green";

    setTimeout(() => {
        cerrarModal();
        cargarUsuarios();
    }, 800);
});

//======================== MODAL EDITAR ========================//

const modalEditar = document.getElementById("modalEditar");

function abrirModalEditar(id) {
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
        alert("Usuario no encontrado");
        return;
    }

    document.getElementById("editId").value = usuario.id;
    document.getElementById("editNombre").value = usuario.name;
    document.getElementById("editEmail").value = usuario.email;
    document.getElementById("editPassword").value = "";
    document.getElementById("editRol").value = usuario.role;
    document.getElementById("msgEditar").textContent = "";

    modalEditar.style.display = "flex";
}

function cerrarModalEditar() {
    modalEditar.style.display = "none";
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target == modalCrear) cerrarModal();
    if (event.target == modalEditar) cerrarModalEditar();
}

//======================== GUARDAR EDICIÓN ========================//

document.getElementById("btnGuardarEdicion").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const nombre = document.getElementById("editNombre").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const password = document.getElementById("editPassword").value.trim();
    const rol = document.getElementById("editRol").value;
    const msg = document.getElementById("msgEditar");

    if (!nombre || !email) {
        msg.textContent = "Nombre y email son obligatorios";
        msg.style.color = "red";
        return;
    }

    if (password && password.length < 6) {
        msg.textContent = "La contraseña debe tener al menos 6 caracteres";
        msg.style.color = "red";
        return;
    }

    try {
        const body = { name: nombre, email, role: rol };
        
        // Solo agregar password si se ingresó uno nuevo
        if (password) {
            body.password = password;
        }

        console.log("Enviando:", body); // Debug

        const res = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log("Respuesta:", data); // Debug

        if (!res.ok) {
            msg.textContent = data.error || "Error al actualizar";
            msg.style.color = "red";
            return;
        }

        msg.textContent = " Usuario actualizado correctamente";
        msg.style.color = "green";

        setTimeout(() => {
            cerrarModalEditar();
            cargarUsuarios();
        }, 1000);

    } catch (error) {
        console.error("Error:", error);
        msg.textContent = "Error de conexión";
        msg.style.color = "red";
    }
});

//======================== ELIMINAR USUARIO ========================//

async function eliminarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    
    if (!confirm(`¿Eliminar a "${usuario.name}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        console.log("Eliminando usuario ID:", id); // Debug

        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        console.log("Status respuesta:", res.status); // Debug

        if (!res.ok) {
            const data = await res.json();
            alert(data.error || "Error al eliminar usuario");
            return;
        }

        alert(" Usuario eliminado correctamente");
        cargarUsuarios();

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión");
    }
}