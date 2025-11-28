const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const nombre = localStorage.getItem("nombre");

const API = "http://127.0.0.1:8001/tickets";

if (!token || role !== "admin") {
    window.location.href = "login.html";
}

document.getElementById("adminNombre").textContent = nombre;

// -------------------- LOGOUT -------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

// -------------------- CARGAR TICKETS -------------------
let tickets = [];

async function cargarTickets() {
    const res = await fetch(`${API}/all`, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (res.status === 204) {
        document.getElementById("tablaTickets").innerHTML = `
            <tr><td colspan="6">No hay tickets registrados</td></tr>`;
        return;
    }

    tickets = await res.json();
    mostrarTabla(tickets);
}

function mostrarTabla(lista) {
    const tbody = document.getElementById("tablaTickets");
    tbody.innerHTML = "";

    lista.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${t.titulo}</td>
                <td>${t.estado}</td>
                <td>${t.gestor ? t.gestor.name : "—"}</td>
                <td>${t.admin ? t.admin.name : "—"}</td>
                <td><button onclick="verTicket(${t.id})">Ver</button></td>
            </tr>
        `;
    });
}

cargarTickets();

// -------------------- BUSCADOR -------------------
document.getElementById("search").addEventListener("input", function () {
    const texto = this.value.toLowerCase();

    const filtrados = tickets.filter(t =>
        t.titulo.toLowerCase().includes(texto) ||
        t.id.toString().includes(texto) ||
        (t.gestor?.nombre?.toLowerCase() || "").includes(texto)
    );

    mostrarTabla(filtrados);
});

// -------------------- FILTRO POR ESTADO -------------------
document.getElementById("filtroEstado").addEventListener("change", function () {
    const estado = this.value;

    if (estado === "") {
        mostrarTabla(tickets);
        return;
    }

    const filtrados = tickets.filter(t => t.estado === estado);
    mostrarTabla(filtrados);
});

// -------------------- IR A PAGINA DE DETALLE -------------------
function verTicket(id) {
    window.location.href = `ticket_detalle_admin.html?id=${id}`;
}
