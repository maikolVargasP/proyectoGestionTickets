const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const API = "http://127.0.0.1:8001/tickets";

if (!token || role !== "admin") {
    window.location.href = "login.html";
}

// --- LOGOUT ---
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

// ---------------- Cargar Ticket -----------------
async function cargarTicket() {
    const res = await fetch(`${API}/${ticketId}`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    document.getElementById("tId").textContent = data.id;
    document.getElementById("tTitulo").textContent = data.titulo;
    document.getElementById("tDescripcion").textContent = data.descripcion;
    document.getElementById("tEstado").textContent = data.estado;

    document.getElementById("tGestor").textContent = data.gestor
        ? data.gestor.name || data.gestor.email
        : "N/A";

    document.getElementById("tAdmin").textContent = data.admin
        ? data.admin.name || data.admin.email
        : "Sin asignar";

    document.getElementById("selectEstado").value = data.estado;
}

cargarTicket();

// ---------------- Cargar Gestores -----------------
async function cargarGestores() {
    const res = await fetch("http://127.0.0.1:8000/usuarios/gestores", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    const select = document.getElementById("selectGestor");

    data.forEach(g => {
        select.innerHTML += `<option value="${g.id}">${g.name} (${g.email})</option>`;
    });
}

cargarGestores();

// ---------------- Cargar Actividades -----------------
async function cargarActividades() {
    const res = await fetch(`${API}/${ticketId}/actividades`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    const list = document.getElementById("listaActividades");

    list.innerHTML = "";

    data.forEach(a => {
        list.innerHTML += `
            <li><strong>${a.usuario?.name || a.usuario?.email}:</strong> ${a.mensaje}</li>
        `;
    });
}

cargarActividades();

// ---------------- Cambiar Estado -----------------
document.getElementById("btnCambiarEstado").addEventListener("click", async () => {
    const estado = document.getElementById("selectEstado").value;
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

// ---------------- Asignar Gestor -----------------
document.getElementById("btnAsignarGestor").addEventListener("click", async () => {
    const gestorId = document.getElementById("selectGestor").value;
    const msg = document.getElementById("msgAsignar");

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

// ---------------- Agregar Actividad -----------------
document.getElementById("btnAgregarActividad").addEventListener("click", async () => {
    const mensaje = document.getElementById("actividadTexto").value.trim();
    const msg = document.getElementById("msgActividad");

    if (mensaje === "") {
        msg.textContent = "El mensaje no puede estar vacío";
        msg.style.color = "red";
        return;
    }

    const res = await fetch(`${API}/${ticketId}/actividad`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ mensaje })
    });

    if (!res.ok) {
        msg.textContent = "Error al agregar actividad";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Actividad agregada";
    msg.style.color = "green";
    document.getElementById("actividadTexto").value = "";

    cargarActividades();
});
