const API_URL = "http://127.0.0.1:8000/usuarios";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorLabel = document.getElementById("loginError");

    errorLabel.textContent = "";

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorLabel.textContent = data.error || "Error al iniciar sesión";
            return;
        }

        // Guardar token
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // Redireccionar
        window.location.href = "dashboard.html";

    } catch (err) {
        errorLabel.textContent = "Error de conexión con el servidor";
    }
});
