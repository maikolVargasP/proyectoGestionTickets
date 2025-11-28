const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    window.location.href = "login.html";
}

const API = "http://127.0.0.1:8001/tickets";

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

function volverDashboard() {
    window.location.href = "dashboard_admin.html";
}

// ------------------------ CARGAR INFO DEL TICKET ------------------------
async function cargarTicket() {
    const res = await fetch(`${API}/${ticketId}`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const t = await res.json();

    document.getElementById("tId").textContent = t.id;
    document.getElementById("tTitulo").textContent = t.titulo;
    document.getElementById("tDescripcion").textContent = t.descripcion;
    document.getElementById("tEstado").textContent = t.estado;
    document.getElementById("tGestor").textContent = t.gestor ? t.gestor.nombre : "Sin asignar";
    document.getElementById("tAdmin").textContent = t.admin ? t.admin.nombre : "—";

    document.getElementById("nuevoEstado").value = t.estado;
}

cargarTicket();

// ------------------------ CAMBIAR ESTADO ------------------------
document.getElementById("btnCambiarEstado").addEventListener("click", async () => {
    const estado = document.getElementById("nuevoEstado").value;
    const msg = document.getElementById("msgEstado");

    const res = await fetch(`${API}/${ticketId}/estado`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ estado })
    });

    if (!res.ok) {
        msg.textContent = "Error al cambiar estado";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Estado actualizado";
    msg.style.color = "green";

    cargarTicket();
    cargarActividades();
});

// ------------------------ LISTAR GESTORES ------------------------
async function cargarGestores() {
    const res = await fetch("http://127.0.0.1:8000/usuarios/gestores");

    const gestores = await res.json();

    const sel = document.getElementById("listaGestores");
    sel.innerHTML = "";

    gestores.forEach(g => {
        sel.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
}

cargarGestores();

// ------------------------ ASIGNAR GESTOR ------------------------
document.getElementById("btnAsignarGestor").addEventListener("click", async () => {
    const gestorId = document.getElementById("listaGestores").value;
    const msg = document.getElementById("msgGestor");

    const res = await fetch(`${API}/${ticketId}/assign`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ gestor_id: gestorId })
    });

    if (!res.ok) {
        msg.textContent = "Error al asignar gestor";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Gestor asignado correctamente";
    msg.style.color = "green";

    cargarTicket();
    cargarActividades();
});

// ------------------------ HISTORIAL / ACTIVIDADES ------------------------
async function cargarActividades() {
    const res = await fetch(`${API}/${ticketId}/actividades`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const actividades = await res.json();

    const ul = document.getElementById("listaActividades");
    ul.innerHTML = "";

    actividades.forEach(a => {
        ul.innerHTML += `
            <li>
                <b>${a.user_id}</b> - ${a.mensaje}
                <br>
                <small>${a.created_at}</small>
            </li>
        `;
    });
}

cargarActividades();

// ------------------------ AGREGAR COMENTARIO ------------------------
document.getElementById("btnComentar").addEventListener("click", async () => {
    const mensaje = document.getElementById("comentario").value.trim();
    const msg = document.getElementById("msgComentario");

    if (mensaje === "") {
        msg.textContent = "Escribe algo antes de enviar";
        msg.style.color = "red";
        return;
    }

    const res = await fetch(`${API}/${ticketId}/comentarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ mensaje })
    });

    if (!res.ok) {
        msg.textContent = "Error al enviar comentario";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Comentario agregado";
    msg.style.color = "green";

    document.getElementById("comentario").value = "";
    cargarActividades();
});
