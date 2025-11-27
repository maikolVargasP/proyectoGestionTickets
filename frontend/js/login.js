document.getElementById("loginForm").addEventListener("submit", async function(e) { 
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const btn = document.getElementById("btnLogin");

    errorMsg.textContent = "";
    btn.disabled = true;
    btn.textContent = "Ingresando...";
    

    try {
        const response = await fetch("http://127.0.0.1:8000/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Error desconocido");
        }

        const data = await response.json();

        // Guardar token y datos del usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.user.name);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("id", data.user.id);

        // Redirigir según rol
        if (data.user.role === "admin") {
            window.location.href = "dashboard_admin.html";
        } else {
            window.location.href = "dashboard_gestor.html";
        }

    } catch (error) {
        errorMsg.textContent = error.message;
    } finally {
        btn.disabled = false;
        btn.textContent = "Ingresar";
    }
});
