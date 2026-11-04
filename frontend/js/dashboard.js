document.addEventListener("DOMContentLoaded", async () => {
    // Get the access token from localStorage
    const token = localStorage.getItem("access_token");
    
    // If no token is found, redirect the user to the login page
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // Get the user email element and the logout button
    const userEmailElement = document.getElementById("userEmail");
    const logoutBtn = document.getElementById("logoutBtn");

    try {
        // Fetch the email data from the backend
        const user = await fetchAPI("/auth/me");
        
        // Render the email in the dashboard
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    } catch (error) {
        console.error("Failed to fetch user:", error);
        // If we get an error (like 401 Unauthorized), we should log the user out
        localStorage.removeItem("access_token");
        window.location.href = "index.html";
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("access_token");
            window.location.href = "index.html";
        });
    }
});