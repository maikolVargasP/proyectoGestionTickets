const API_TICKETS = "http://127.0.0.1:8001/tickets";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Si no hay token → login
if (!token) {
    window.location.href = "index.html";
}

// Si no es gestor → no puede entrar aquí
if (role !== "gestor") {
    alert("Acceso restringido. Debes iniciar como gestor.");
    window.location.href = "index.html";
}

const ticketList = document.getElementById("ticketList");

// ===============================
//   Cargar tickets del gestor
// ===============================
async function cargarMisTickets() {
    const res = await fetch(`${API_TICKETS}/mine`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (res.status === 204) {
        ticketList.innerHTML = `<tr><td colspan="5">No tienes tickets</td></tr>`;
        return;
    }

    const tickets = await res.json();

    ticketList.innerHTML = "";

    tickets.forEach(ticket => {
        ticketList.innerHTML += `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.titulo}</td>
                <td>${ticket.estado}</td>
                <td>${ticket.admin ? ticket.admin.nombre : "No asignado"}</td>
                <td>
                    <button onclick="verTicket(${ticket.id})">Ver</button>
                </td>
            </tr>
        `;
    });
}

cargarMisTickets();

// ===============================
//   Crear Ticket (Modal)
// ===============================

document.getElementById("btnCrearTicket").addEventListener("click", () => {
    document.getElementById("modalCrear").classList.remove("hidden");
});

document.getElementById("cerrarModal").addEventListener("click", () => {
    document.getElementById("modalCrear").classList.add("hidden");
});

document.getElementById("crearOK").addEventListener("click", async () => {
    const titulo = document.getElementById("tituloNuevo").value;
    const descripcion = document.getElementById("descripcionNuevo").value;

    if (!titulo || !descripcion) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    const res = await fetch(`${API_TICKETS}/create`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ titulo, descripcion })
    });

    if (!res.ok) {
        alert("Error al crear ticket");
        return;
    }

    document.getElementById("modalCrear").classList.add("hidden");
    cargarMisTickets();
});

// ===============================
//   Logout
// ===============================
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// ===============================
//   Ver ticket (aún no creado)
// ===============================
function verTicket(id) {
    alert("Luego haremos pantalla de detalle de ticket");
}
