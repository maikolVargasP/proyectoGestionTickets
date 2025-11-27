const token = localStorage.getItem("token");
const nombre = localStorage.getItem("nombre");
const role = localStorage.getItem("role");

const API = "http://127.0.0.1:8001/tickets";

// Si no hay token, sacar del dashboard
if (!token || role !== "gestor") {
    window.location.href = "login.html";
}

document.getElementById("gestorNombre").textContent = nombre;

// ------------------- LOGOUT --------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

// ------------------- CARGAR MIS TICKETS --------------------
async function cargarMisTickets() {
    const res = await fetch(`${API}/mine`, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (res.status === 204) {
        document.getElementById("tablaTickets").innerHTML =
            `<tr><td colspan="4">No tienes tickets aún</td></tr>`;
        return;
    }

    const data = await res.json();

    let html = "";
    data.forEach(t => {
        html += `
            <tr>
                <td>${t.id}</td>
                <td>${t.titulo}</td>
                <td>${t.estado}</td>
                <td><button onclick="verTicket(${t.id})">Ver</button></td>
            </tr>
        `;
    });

    document.getElementById("tablaTickets").innerHTML = html;
}

cargarMisTickets();

// ------------------- CREAR TICKET --------------------
document.getElementById("crearTicketForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const msg = document.getElementById("crearMsg");

    const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ titulo, descripcion })
    });

    if (!res.ok) {
        msg.textContent = "Error al crear ticket";
        msg.style.color = "red";
        return;
    }

    msg.textContent = "Ticket creado correctamente";
    msg.style.color = "green";

    document.getElementById("crearTicketForm").reset();

    cargarMisTickets();
});

// ------------------- IR A VER TICKET --------------------
function verTicket(id) {
    window.location.href = `ticket_detalle_gestor.html?id=${id}`;
}
