const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const nombre = localStorage.getItem("nombre");

const API = "http://127.0.0.1:8001/tickets";

// Si no es admin → fuera
if (!token || role !== "admin") {
    window.location.href = "login.html";
}

document.getElementById("adminNombre").textContent = nombre;

// ---------------- LOGOUT ----------------
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

// ---------------- CARGAR TODOS LOS TICKETS ----------------
async function cargarTicketsAdmin() {
    const res = await fetch(`${API}/all`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    let html = "";

    data.forEach(t => {
        html += `
            <tr>
                <td>${t.id}</td>
                <td>${t.titulo}</td>
                <td>${t.estado}</td>
                <td>${t.creador?.name || "N/A"}</td>
                <td>${t.asignado?.name || "Sin asignar"}</td>
                <td>
                    <button onclick="verTicket(${t.id})">Ver</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("tablaTicketsAdmin").innerHTML = html;
}

async function cargarTicketsAdmin() {
    const res = await fetch(`${API}/all`, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
        document.getElementById("tablaTicketsAdmin").innerHTML = `<tr><td colspan="6">Error al cargar tickets</td></tr>`;
        return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        document.getElementById("tablaTicketsAdmin").innerHTML = `<tr><td colspan="6">No hay tickets</td></tr>`;
        return;
    }

    let html = "";

    data.forEach(t => {
        // tu backend devuelve relaciones como 'gestor' y 'admin'
        const creador = t.gestor ? (t.gestor.name || t.gestor.nombre || t.gestor.email) : "N/A";
        const asignado = t.admin ? (t.admin.name || t.admin.nombre || t.admin.email) : "Sin asignar";

        html += `
            <tr>
                <td>${t.id}</td>
                <td>${escapeHtml(t.titulo)}</td>
                <td>${escapeHtml(t.estado)}</td>
                <td>${escapeHtml(creador)}</td>
                <td>${escapeHtml(asignado)}</td>
                <td>
                    <button class="btn-primary" onclick="verTicket(${t.id})">Ver</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("tablaTicketsAdmin").innerHTML = html;
}

// helper escape
function escapeHtml(text) {
  if (!text && text !== 0) return '';
  return String(text).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}


// ---------------- VER DETALLE ----------------
function verTicket(id) {
    window.location.href = `ticket_detalle_admin.html?id=${id}`;
}
