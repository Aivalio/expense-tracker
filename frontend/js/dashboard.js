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

/**
 * Συνάρτηση δυναμικής ενημέρωσης της μπάρας προόδου budget
 * @param {number} currentMonthSpent - Τα έξοδα του τρέχοντος μήνα
 * @param {number} monthlyBudget - Το όριο budget που έχει οριστεί
 */
function updateBudgetProgress(currentMonthSpent, monthlyBudget) {
    const progressBar = document.getElementById("budgetProgressBar");
    const progressLabel = document.getElementById("budgetProgressLabel");
    const percentageLabel = document.getElementById("budgetPercentageLabel");
    
    if (!progressBar || !progressLabel || !percentageLabel) return;

    const budget = parseFloat(monthlyBudget) || 0;
    const spent = parseFloat(currentMonthSpent) || 0;

    progressLabel.textContent = `Spent: €${spent.toFixed(2)} / €${budget.toFixed(2)}`;

    if (budget <= 0) {
        progressBar.style.width = "0%";
        percentageLabel.textContent = "0%";
        progressBar.className = "bg-slate-400 h-2.5 rounded-full transition-all duration-500";
        return;
    }

    let percentage = Math.round((spent / budget) * 100);
    let displayPercentage = percentage > 100 ? 100 : percentage;
    
    progressBar.style.width = `${displayPercentage}%`;
    percentageLabel.textContent = `${percentage}%`;

    // Δυναμική αλλαγή χρώματος μπάρας ανάλογα με το ποσοστό
    if (percentage >= 100) {
        progressBar.className = "bg-red-600 h-2.5 rounded-full transition-all duration-500"; // Κόκκινο
    } else if (percentage >= 75) {
        progressBar.className = "bg-amber-500 h-2.5 rounded-full transition-all duration-500"; // Πορτοκαλί / Amber
    } else {
        progressBar.className = "bg-emerald-500 h-2.5 rounded-full transition-all duration-500"; // Πράσινο
    }
}

// Export for Jest testing if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = { updateBudgetProgress };
}