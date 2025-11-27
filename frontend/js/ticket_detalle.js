const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const API = "http://127.0.0.1:8001/tickets";

if (!token || role !== "gestor") {
    window.location.href = "login.html";
}

// --------------------------------------
// Cargar detalles del ticket
// --------------------------------------
async function cargarTicket() {
    const res = await fetch(`${API}/${ticketId}`, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
        alert("No se pudo cargar el ticket");
        return;
    }

    const t = await res.json();

    document.getElementById("ticketId").textContent = t.id;
    document.getElementById("ticketTitulo").textContent = t.titulo;
    document.getElementById("ticketDescripcion").textContent = t.descripcion;
    document.getElementById("ticketEstado").textContent = t.estado;
    document.getElementById("ticketAdmin").textContent = t.admin ? t.admin.nombre : "Sin asignar";
}

cargarTicket();

// --------------------------------------
// Cargar historial de actividades
// --------------------------------------
async function cargarActividades() {
    const res = await fetch(`${API}/${ticketId}/actividades`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const actividades = await res.json();

    let html = "";

    actividades.forEach(a => {
        html += `
            <div class="actividad-item">
                <strong>${a.user_id}</strong>: ${a.mensaje}
                <br>
                <small>${a.created_at}</small>
            </div>
        `;
    });

    document.getElementById("listaActividades").innerHTML = html;
}

cargarActividades();

// --------------------------------------
// Enviar comentario
// --------------------------------------
document.getElementById("comentarioForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensaje = document.getElementById("mensaje").value.trim();
    const msg = document.getElementById("comentarioMsg");

    if (mensaje === "") return;

    const res = await fetch(`${API}/${ticketId}/comentarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ mensaje })
    });

    if (!res.ok) {
        msg.textContent = "Error enviando comentario";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Comentario enviado";
    msg.style.color = "green";

    document.getElementById("comentarioForm").reset();

    cargarActividades();  // actualizar lista
});
