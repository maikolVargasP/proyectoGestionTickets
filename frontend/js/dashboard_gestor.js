// proteger la página
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const userId = localStorage.getItem('id');
const userName = localStorage.getItem('nombre');

if (!token) {
  window.location.href = 'index.html'; // o login.html
}
if (role !== 'gestor') {
    alert('Acceso denegado: necesitas rol gestor');
    localStorage.clear();
    window.location.href = 'index.html';
}

// DOM refs
document.getElementById('userName').textContent = userName || 'Gestor';
const ticketsBody = document.getElementById('ticketsBody');
const countAbierto = document.getElementById('countAbierto');
const countProgreso = document.getElementById('countProgreso');
const countCerrado = document.getElementById('countCerrado');

const API_TICKETS = 'http://127.0.0.1:8001/tickets';

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    cargarTickets();
    actualizarStats();
});

// Fetch tickets del gestor
async function cargarTickets(estado = '') {
    try {
        let url = `${API_TICKETS}/mine`;
        if (estado) url += `?estado=${encodeURIComponent(estado)}`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 204) {
            ticketsBody.innerHTML = '<tr><td colspan="5">No hay tickets</td></tr>';
            return;
        }
        if (!res.ok) throw new Error('Error al obtener tickets');

        const tickets = await res.json();
        renderTickets(tickets);
    } catch (err) {
        ticketsBody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
    }
}

function renderTickets(tickets) {
    ticketsBody.innerHTML = '';
    tickets.forEach(t => {
        const admin = t.admin ? t.admin.nombre : 'No asignado';
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${t.id}</td>
        <td>${escapeHtml(t.titulo)}</td>
        <td>${t.estado}</td>
        <td>${escapeHtml(admin)}</td>
        <td>
            <button class="btn-ghost" onclick="verTicket(${t.id})">Ver</button>
        </td>
        `;
        ticketsBody.appendChild(tr);
    });
}

// escape simple
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// stats
async function actualizarStats() {
    try {
        const res = await fetch(`${API_TICKETS}/mine`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!res.ok && res.status !== 204) return;
        const datos = (res.status === 204) ? [] : await res.json();
        const abierto = datos.filter(t => t.estado === 'abierto').length;
        const prog = datos.filter(t => t.estado === 'en_progreso').length;
        const cerrado = datos.filter(t => t.estado === 'cerrado' || t.estado === 'resuelto').length;
        countAbierto.textContent = abierto;
        countProgreso.textContent = prog;
        countCerrado.textContent = cerrado;
    } catch (e) {
        // silent
    }
}

// crear ticket
document.getElementById('btnCrear').addEventListener('click', async () => {
    const titulo = document.getElementById('nuevoTitulo').value.trim();
    const descripcion = document.getElementById('nuevaDescripcion').value.trim();
    const msg = document.getElementById('crearMsg');
    msg.textContent = '';

    if (!titulo || !descripcion) {
        msg.textContent = 'Todos los campos son obligatorios';
        return;
    }

    try {
        const res = await fetch(`${API_TICKETS}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titulo, descripcion })
        });
        if (!res.ok) {
            const err = await res.json();
            msg.textContent = err.error || 'Error al crear ticket';
            return;
        }
        // limpiar inputs
        document.getElementById('nuevoTitulo').value = '';
        document.getElementById('nuevaDescripcion').value = '';
        msg.textContent = 'Ticket creado correctamente';
        cargarTickets();
        actualizarStats();
    } catch (err) {
        msg.textContent = 'Error de conexión';
    }
});

// filtrar / refrescar
document.getElementById('btnFiltrar').addEventListener('click', () => {
    const estado = document.getElementById('filterEstado').value;
    cargarTickets(estado);
});
document.getElementById('btnRefrescar').addEventListener('click', () => { cargarTickets(); actualizarStats(); });

// logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// ver ticket
window.verTicket = function(id) {
  // navegar a página detalle con id en querystring
    window.location.href = `ticket.html?id=${id}`;
};
