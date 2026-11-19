let categoryChartInstance = null;
let monthlyChartInstance = null;

async function updateDashboardAnalytics() {
    try {
        const [expenses, categories] = await Promise.all([
            fetchAPI("/expenses/"),
            fetchAPI("/categories/")
        ]);

        // 1. Update Summary Cards
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const now = new Date();
        const currentMonthTotal = expenses
            .filter(exp => {
                const d = new Date(exp.date || exp.created_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        document.getElementById("totalExpenses").textContent = `€${total.toFixed(2)}`;
        document.getElementById("currentMonthExpenses").textContent = `€${currentMonthTotal.toFixed(2)}`;
        document.getElementById("totalCategories").textContent = categories.length;

        // 2. Group by Category for Doughnut Chart
        const categoryMap = {};
        categories.forEach(cat => { categoryMap[cat.id] = { name: cat.name, total: 0 }; });
        expenses.forEach(exp => {
            if (categoryMap[exp.category_id]) {
                categoryMap[exp.category_id].total += parseFloat(exp.amount);
            }
        });

        const activeCategories = Object.values(categoryMap).filter(c => c.total > 0);
        const catLabels = activeCategories.length ? activeCategories.map(c => c.name) : ["No expenses yet"];
        const catData = activeCategories.length ? activeCategories.map(c => c.total) : [1];
        const catColors = activeCategories.length
            ? ["#2563eb", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"]
            : ["#e2e8f0"];

        const ctxCategory = document.getElementById("categoryChart").getContext("2d");
        if (categoryChartInstance) categoryChartInstance.destroy();
        categoryChartInstance = new Chart(ctxCategory, {
            type: "doughnut",
            data: {
                labels: catLabels,
                datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 3. Group by Month for Bar Chart (Last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTotals = new Array(12).fill(0);
        expenses.forEach(exp => {
            const d = new Date(exp.date || exp.created_at);
            if (d.getFullYear() === now.getFullYear()) {
                monthlyTotals[d.getMonth()] += parseFloat(exp.amount);
            }
        });

        const ctxMonthly = document.getElementById("monthlyChart").getContext("2d");
        if (monthlyChartInstance) monthlyChartInstance.destroy();
        monthlyChartInstance = new Chart(ctxMonthly, {
            type: "bar",
            data: {
                labels: monthNames,
                datasets: [{
                    label: `Expenses ${now.getFullYear()} (€)`,
                    data: monthlyTotals,
                    backgroundColor: "#2563eb",
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

    } catch (error) {
        console.error("Failed to update analytics:", error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateDashboardAnalytics();

    // Re-render charts whenever a form is submitted or a delete button is clicked
    document.addEventListener("submit", () => setTimeout(updateDashboardAnalytics, 600));
    document.getElementById("expensesList")?.addEventListener("click", (e) => {
        if (e.target.closest("button")) setTimeout(updateDashboardAnalytics, 600);
    });
});