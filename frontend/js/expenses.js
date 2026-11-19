// Wait until the HTML document has completely loaded
document.addEventListener("DOMContentLoaded", async () => {

    // 0. HELPER FUNCTION FOR CLEAN NOTIFICATIONS UNDER BUTTONS
    function showNotification(elementId, message, isError = false) {
        const msgDiv = document.getElementById(elementId);
        if (!msgDiv) return;

        msgDiv.textContent = message;
        if (isError) {
            msgDiv.className = "p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-300 block shadow-sm mt-2";
        } else {
            msgDiv.className = "p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 block shadow-sm mt-2";
        }

        setTimeout(() => {
            msgDiv.className = "hidden p-3 rounded-lg text-xs font-medium";
        }, 4000);
    }

    // 1. GET HTML ELEMENTS
    const expenseForm = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("category");
    const expensesList = document.getElementById("expensesList");
    const categoryForm = document.getElementById("categoryForm");
    const searchInput = document.getElementById("searchInput");       // Search Input
    const exportCsvBtn = document.getElementById("exportCsvBtn");   // Export CSV Button

    // Global array to store fetched expenses for client-side filtering and export
    let allExpenses = [];
    
    // 2. CHECK USER AUTHENTICATION
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }
    
    // 3. LOAD CATEGORIES FROM THE BACKEND
    async function loadCategories() {
        try {
            const categories = await fetchAPI("/categories/");

            categorySelect.innerHTML =
                '<option value="">Select a category</option>';

            if (!categories || categories.length === 0) {
                categorySelect.innerHTML =
                    '<option value="">No categories found. Create one first!</option>';
                return;
            }

            categories.forEach((cat) => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading categories:", error);
            categorySelect.innerHTML =
                '<option value="">Failed to load categories</option>';
        }
    }
    
    // Helper function to render a given array of expenses
    function renderExpenses(expensesToRender) {
        expensesList.innerHTML = "";

        if (!expensesToRender || expensesToRender.length === 0) {
            expensesList.innerHTML =
                '<p class="text-gray-500 text-center py-4">No matching expenses found.</p>';
            return;
        }

        expensesToRender.forEach((exp) => {
            const div = document.createElement("div");
            div.className =
                "flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-2 hover:bg-gray-50 transition-colors";
            
            const details = document.createElement("div");
            const description = document.createElement("p");
            description.className = "font-bold text-gray-800";
            description.textContent = exp.description || "Expense";

            const date = document.createElement("p");
            date.className = "text-xs text-gray-500 mt-1";
            date.textContent = "📅 " + (exp.date || "Date unavailable");

            details.appendChild(description);
            details.appendChild(date);

            const actions = document.createElement("div");
            actions.className = "flex items-center space-x-4";

            const amount = document.createElement("div");
            amount.className = "text-lg font-bold text-red-600";
            amount.textContent = "-€" + Number(exp.amount).toFixed(2);

            const deleteButton = document.createElement("button");
            deleteButton.className =
                "text-gray-400 hover:text-red-600 transition-colors";
            deleteButton.title = "Delete expense";
            deleteButton.setAttribute("aria-label", "Delete expense");

            deleteButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                </svg>
            `;

            deleteButton.addEventListener("click", () => {
                deleteExpense(exp.id);
            });

            actions.appendChild(amount);
            actions.appendChild(deleteButton);

            div.appendChild(details);
            div.appendChild(actions);
            expensesList.appendChild(div);
        });
    }

    // 4. LOAD AND DISPLAY EXPENSES
    async function loadExpenses() {
        try {
            expensesList.innerHTML =
                '<p class="text-gray-500 text-center py-4">Loading expenses...</p>';

            const expenses = await fetchAPI("/expenses/");
            allExpenses = expenses || []; // Save to global array

            if (allExpenses.length === 0) {
                expensesList.innerHTML =
                    '<p class="text-gray-500 text-center py-4">No expenses yet. Add one on the left!</p>';
                return;
            }

            renderExpenses(allExpenses);

        } catch (error) {
            console.error("Error loading expenses:", error);
            expensesList.innerHTML =
                '<p class="text-red-500 text-center">Failed to load expenses.</p>';
        }
    }

    // 4.1 SEARCH EVENT LISTENER
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allExpenses.filter(exp => 
                (exp.description && exp.description.toLowerCase().includes(query))
            );
            renderExpenses(filtered);
        });
    }
    
    // 4.2 EXPORT CSV FUNCTIONALITY
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            if (!allExpenses || allExpenses.length === 0) {
                showNotification("csvMessage", "No expenses available to export!", true);
                return;
            }

            const headers = ["ID", "Description", "Amount (€)", "Date"];
            
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
            const dataToExport = query 
                ? allExpenses.filter(exp => exp.description && exp.description.toLowerCase().includes(query))
                : allExpenses;

            if (dataToExport.length === 0) {
                showNotification("csvMessage", "No matching expenses found for export.", true);
                return;
            }

            const csvRows = [];
            csvRows.push(headers.join(","));

            dataToExport.forEach(exp => {
                const row = [
                    exp.id,
                    `"${(exp.description || "Expense").replace(/"/g, '""')}"`,
                    exp.amount,
                    `"${exp.date || "N/A"}"`
                ];
                csvRows.push(row.join(","));
            });

            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Εμφάνιση μηνύματος επιτυχίας
            showNotification("csvMessage", "CSV exported successfully!");
        });
    }

    // 5. CREATE A NEW EXPENSE
    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const amount = parseFloat(document.getElementById("amount").value);
            const category_id = parseInt(categorySelect.value, 10);
            const description = document.getElementById("description").value.trim();
            const submitBtn = expenseForm.querySelector("button[type='submit']");

            if (!Number.isFinite(amount) || amount <= 0) {
                showNotification("expenseMessage", "Please enter a valid expense amount.", true);
                return;
            }

            if (!Number.isInteger(category_id)) {
                showNotification("expenseMessage", "Please select a category first!", true);
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Saving...";

                await fetchAPI("/expenses/", {
                    method: "POST",
                    body: JSON.stringify({
                        amount: amount,
                        category_id: category_id,
                        description: description
                    })
                });

                expenseForm.reset();
                await loadExpenses();
                showNotification("expenseMessage", "Expense added successfully!");

            } catch (error) {
                console.error("Error adding expense:", error);
                showNotification("expenseMessage", "Error adding expense: " + error.message, true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save Expense";
            }
        });
    }
    
    // 6. CREATE A NEW CATEGORY
    if (categoryForm) {
        categoryForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const categoryName = document.getElementById("newCategoryName").value.trim();

            if (!categoryName) {
                showNotification("categoryMessage", "Please enter a category name.", true);
                return;
            }

            const categoryBtn = categoryForm.querySelector("button[type='submit']");

            try {
                categoryBtn.disabled = true;
                categoryBtn.textContent = "Adding...";

                const randomColor =
                    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

                await fetchAPI("/categories/", {
                    method: "POST",
                    body: JSON.stringify({
                        name: categoryName,
                        color: randomColor
                    })
                });

                categoryForm.reset();
                await loadCategories();
                showNotification("categoryMessage", "Category created successfully!");

            } catch (error) {
                console.error("Error creating category:", error);
                showNotification("categoryMessage", "Error creating category: " + error.message, true);
            } finally {
                categoryBtn.disabled = false;
                categoryBtn.textContent = "Add";
            }
        });
    }

    // 7. DELETE AN EXPENSE
    async function deleteExpense(id) {
        const confirmed = confirm("Are you sure you want to delete this expense?");
        if (!confirmed) {
            return;
        }

        try {
            await fetchAPI(`/expenses/${id}/`, {
                method: "DELETE"
            });

            await loadExpenses();

        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    }
    
    // 8. INITIALIZE THE DASHBOARD
    await Promise.all([
        loadCategories(),
        loadExpenses()
    ]);
});

// Export for Jest testing if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = {};
}