const API_TICKETS = 'http://127.0.0.1:8001/tickets';
const tokenT = localStorage.getItem('token');
const roleT = localStorage.getItem('role');
const nameT = localStorage.getItem('nombre');
const userIdT = localStorage.getItem('id');

if (!tokenT) {
    window.location.href = 'index.html';
}
document.getElementById('userNameTicket').textContent = nameT || 'Gestor';

document.getElementById('logoutBtnTicket').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// obtener id del querystring
const qs = new URLSearchParams(location.search);
const ticketId = qs.get('id');
if (!ticketId) {
    alert('ID de ticket faltante');
    window.location.href = 'dashboard_gestor.html';
}

// cargar info
async function cargarTicket() {
    try {
        const res = await fetch(`${API_TICKETS}/${ticketId}`, {
            headers: { 'Authorization': `Bearer ${tokenT}` }
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>({error:'Error'}));
            alert(err.error || 'No se pudo cargar ticket');
            return window.location.href = 'dashboard_gestor.html';
        }
        const ticket = await res.json();
        document.getElementById('ticketTitulo').textContent = ticket.titulo;
        document.getElementById('ticketDescripcion').textContent = ticket.descripcion;
        document.getElementById('ticketEstado').textContent = ticket.estado;
        document.getElementById('ticketGestor').textContent = ticket.gestor ? ticket.gestor.nombre : '—';
        document.getElementById('ticketAdmin').textContent = ticket.admin ? ticket.admin.nombre : 'No asignado';

        // cargar actividades (si tu endpoint /{id} devuelve actividades en relación)
        renderActividades(ticket.actividades || []);
    } catch (err) {
        alert('Error al conectar con el servidor');
    }
    }

    function renderActividades(lista) {
    const root = document.getElementById('actividadesList');
    root.innerHTML = '';
    if (!lista.length) {
        root.innerHTML = '<p class="muted">No hay actividades aún</p>';
        return;
    }
    lista.forEach(a => {
        const div = document.createElement('div');
        div.className = 'actividad';
        const author = a.usuario ? a.usuario.nombre : (`Usuario ${a.user_id}`);
        div.innerHTML = `<div class="autor">${escapeHtml(author)} <span style="font-weight:400;color:#777;font-size:12px;margin-left:8px">${a.created_at ? a.created_at : ''}</span></div>
                        <div class="texto">${escapeHtml(a.mensaje)}</div>`;
        root.appendChild(div);
    });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// comentar
document.getElementById('btnComentar').addEventListener('click', async () => {
    const txt = document.getElementById('comentarioTexto').value.trim();
    const msg = document.getElementById('comentMsg');
    msg.textContent = '';
    if (!txt) { msg.textContent = 'Escribe un mensaje'; return; }

    try {
        const res = await fetch(`${API_TICKETS}/${ticketId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenT}` },
            body: JSON.stringify({ mensaje: txt })
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>({error:'Error'}));
            msg.textContent = err.error || 'No se pudo enviar';
            return;
        }
        const actividad = await res.json();
        // agregar actividad al DOM
        const root = document.getElementById('actividadesList');
        const div = document.createElement('div');
        div.className = 'actividad';
        div.innerHTML = `<div class="autor">${escapeHtml(localStorage.getItem('nombre') || 'Yo')}</div><div class="texto">${escapeHtml(actividad.mensaje)}</div>`;
        root.appendChild(div);
        document.getElementById('comentarioTexto').value = '';
        msg.textContent = 'Comentario agregado';
    } catch (err) {
        msg.textContent = 'Error de conexión';
    }
});

cargarTicket();
