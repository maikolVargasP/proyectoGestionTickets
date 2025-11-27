const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const userId = localStorage.getItem("id");

if (!token || role !== "gestor") {
    window.location.href = "login.html";
}

const API = "http://127.0.0.1:8001/tickets";

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

document.getElementById("ticketId").textContent = ticketId;

// ------------------------ Cargar información del ticket ------------------------
async function cargarTicket() {
    const res = await fetch(`${API}/${ticketId}`, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
        alert("Error al cargar ticket");
        return;
    }

    const t = await res.json();

    document.getElementById("titulo").textContent = t.titulo;
    document.getElementById("descripcion").textContent = t.descripcion;
    document.getElementById("estado").textContent = t.estado;
    document.getElementById("adminAsignado").textContent =
        t.admin ? t.admin.nombre : "Sin asignar";
}

cargarTicket();

// ------------------------ Cargar actividades ------------------------
async function cargarActividades() {
    const res = await fetch(`${API}/${ticketId}/actividades`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    const lista = document.getElementById("listaActividades");

    lista.innerHTML = "";

    data.forEach(a => {
        lista.innerHTML += `
            <li>
                <strong>${a.user_id == userId ? "Tú" : "Usuario #" + a.user_id}:</strong>
                ${a.mensaje}
                <br>
                <small>${a.created_at}</small>
            </li>
        `;
    });
}

cargarActividades();

// ------------------------ Enviar comentario ------------------------
document.getElementById("comentarioForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensaje = document.getElementById("mensaje").value.trim();
    const msg = document.getElementById("comentarioMsg");

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

    document.getElementById("comentarioForm").reset();

    cargarActividades();
});
