document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = ""; // Clear previous errors

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "admin.html"; // Redirect to admin panel on success
        } else {
            errorMessage.textContent = data.message || "Login failed. Please check your credentials.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        errorMessage.textContent = "An error occurred. Please try again later.";
    }
});
