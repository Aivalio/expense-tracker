document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Stop the page from refreshing on form submission
            
            // Get the email and password values from the form inputs
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // FastAPI requires the data be in a specific format for form submissions, so we use URLSearchParams to format it correctly.
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            try {
                const data = await fetchAPI("/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData.toString(),
                });

                // Store the token to localStorage for future requests
                localStorage.setItem("access_token", data.access_token);
                
                // Redirect the user to the Dashboard page after successful login
                window.location.href = "dashboard.html";

            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove("hidden");
            }
        });
    }
});