document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    // Checking if the form exists before triggering the event listener
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Stop the page from refreshing on form submission


            // Get the user data from the form inputs
            const full_name = document.getElementById("full_name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                // Make a POST request to the FastAPI backend to register the user
                await fetchAPI("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ email, password, full_name })
                });

                // Display a success message and redirect the user to the login page after successful registration
                errorMessage.classList.add("hidden");
                successMessage.textContent = "Account created successfully! Redirecting to login...";
                successMessage.classList.remove("hidden");

                // Redirect to the login page after a short delay
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);

            } catch (error) {
                successMessage.classList.add("hidden");
                errorMessage.textContent = error.message;
                errorMessage.classList.remove("hidden");
            }
        });
    }
});