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
    
    // Filter Elements
    const startDateFilter = document.getElementById("startDateFilter");
    const endDateFilter = document.getElementById("endDateFilter");
    const filterDateBtn = document.getElementById("filterDateBtn");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    
    // Budget Elements
    const budgetInput = document.getElementById("budgetInput");
    const saveBudgetBtn = document.getElementById("saveBudgetBtn");
    const resetBudgetBtn = document.getElementById("resetBudgetBtn"); // Reset Budget Button
    const budgetWarningBanner = document.getElementById("budgetWarningBanner");
    const budgetWarningText = document.getElementById("budgetWarningText");
    const budgetOverspendAmount = document.getElementById("budgetOverspendAmount");

    // Global arrays to store data
    let allExpenses = [];
    let allCategories = []; // Αποθήκευση κατηγοριών για τα Badges
    
    // 2. CHECK USER AUTHENTICATION
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // 2.1 LOAD SAVED BUDGET FROM LOCALSTORAGE
    const savedBudget = localStorage.getItem("monthly_budget");
    if (savedBudget && budgetInput) {
        budgetInput.value = savedBudget;
    }
    
    // 3. LOAD CATEGORIES FROM THE BACKEND
    async function loadCategories() {
        try {
            allCategories = await fetchAPI("/categories/") || [];

            categorySelect.innerHTML =
                '<option value="">Select a category</option>';

            if (allCategories.length === 0) {
                categorySelect.innerHTML =
                    '<option value="">No categories found. Create one first!</option>';
                return;
            }

            allCategories.forEach((cat) => {
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
    
    // Helper function to render a given array of expenses with Category Badges
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
            details.className = "space-y-1";

            const descriptionRow = document.createElement("div");
            descriptionRow.className = "flex items-center space-x-2";

            const description = document.createElement("p");
            description.className = "font-bold text-gray-800";
            description.textContent = exp.description || "Expense";
            descriptionRow.appendChild(description);

            // --- CATEGORY BADGE LOGIC ---
            const categoryObj = allCategories.find(c => c.id === exp.category_id);
            if (categoryObj) {
                const badge = document.createElement("span");
                badge.className = "text-xs px-2.5 py-0.5 rounded-full font-medium border shadow-xs";
                badge.textContent = categoryObj.name;
                
                if (categoryObj.color) {
                    badge.style.backgroundColor = categoryObj.color + "20";
                    badge.style.color = categoryObj.color;
                    badge.style.borderColor = categoryObj.color + "50";
                } else {
                    badge.className += " bg-blue-50 text-blue-700 border-blue-200";
                }
                descriptionRow.appendChild(badge);
            }

            const date = document.createElement("p");
            date.className = "text-xs text-gray-500";
            date.textContent = "📅 " + (exp.date || "Date unavailable");

            details.appendChild(descriptionRow);
            details.appendChild(date);

            const actions = document.createElement("div");
            actions.className = "flex items-center space-x-3";

            const amount = document.createElement("div");
            amount.className = "text-lg font-bold text-red-600";
            amount.textContent = "-€" + Number(exp.amount).toFixed(2);

            // --- EDIT BUTTON ---
            const editButton = document.createElement("button");
            editButton.className = "text-gray-400 hover:text-blue-600 transition-colors";
            editButton.title = "Edit expense";
            editButton.setAttribute("aria-label", "Edit expense");
            editButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                </svg>
            `;
            editButton.addEventListener("click", () => {
                openEditModal(exp);
            });

            // --- DELETE BUTTON ---
            const deleteButton = document.createElement("button");
            deleteButton.className = "text-gray-400 hover:text-red-600 transition-colors";
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

            actions.appendChild(editButton);
            actions.appendChild(amount);
            actions.appendChild(deleteButton);

            div.appendChild(details);
            div.appendChild(actions);
            expensesList.appendChild(div);
        });
    }

    // BUDGET CHECK, WARNING BANNER & PROGRESS BAR LOGIC
    function checkBudgetWarning() {
        const currentBudget = parseFloat(localStorage.getItem("monthly_budget")) || 0;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let currentMonthTotal = 0;
        allExpenses.forEach(exp => {
            if (exp.date) {
                const expDate = new Date(exp.date);
                if (expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth) {
                    currentMonthTotal += Number(exp.amount) || 0;
                }
            }
        });

        if (typeof updateBudgetProgress === "function") {
            updateBudgetProgress(currentMonthTotal, currentBudget);
        }

        const currentMonthExpensesEl = document.getElementById("currentMonthExpenses");
        if (currentMonthExpensesEl) {
            currentMonthExpensesEl.textContent = "€" + currentMonthTotal.toFixed(2);
        }

        if (!budgetWarningBanner) return;

        if (currentBudget <= 0) {
            budgetWarningBanner.classList.add("hidden");
            return;
        }

        if (currentMonthTotal > currentBudget) {
            const overspend = currentMonthTotal - currentBudget;
            if (budgetWarningText) {
                budgetWarningText.textContent = `You have spent €${currentMonthTotal.toFixed(2)} of your €${currentBudget.toFixed(2)} monthly budget.`;
            }
            if (budgetOverspendAmount) {
                budgetOverspendAmount.textContent = `Over by €${overspend.toFixed(2)}`;
            }
            budgetWarningBanner.classList.remove("hidden");
        } else {
            budgetWarningBanner.classList.add("hidden");
        }
    }

    // 4. LOAD AND DISPLAY EXPENSES WITH DATE FILTERING SUPPORT
    async function loadExpenses(startDate = "", endDate = "") {
        try {
            expensesList.innerHTML =
                '<p class="text-gray-500 text-center py-4">Loading expenses...</p>';

            let url = "/expenses/";
            const params = [];
            if (startDate) params.push(`start_date=${startDate}`);
            if (endDate) params.push(`end_date=${endDate}`);
            if (params.length > 0) {
                url += `?${params.join("&")}`;
            }

            const expenses = await fetchAPI(url);
            allExpenses = expenses || [];

            if (allExpenses.length === 0) {
                expensesList.innerHTML =
                    '<p class="text-gray-500 text-center py-4">No expenses found for this period.</p>';
                checkBudgetWarning();
                return;
            }

            renderExpenses(allExpenses);
            checkBudgetWarning();

        } catch (error) {
            console.error("Error loading expenses:", error);
            expensesList.innerHTML =
                '<p class="text-red-500 text-center">Failed to load expenses.</p>';
        }
    }

    // 4.1 FILTER BUTTONS EVENT LISTENERS
    if (filterDateBtn) {
        filterDateBtn.addEventListener("click", () => {
            const start = startDateFilter ? startDateFilter.value : "";
            const end = endDateFilter ? endDateFilter.value : "";
            loadExpenses(start, end);
        });
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            if (startDateFilter) startDateFilter.value = "";
            if (endDateFilter) endDateFilter.value = "";
            loadExpenses();
        });
    }

    // 4.2 SEARCH EVENT LISTENER
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allExpenses.filter(exp => 
                (exp.description && exp.description.toLowerCase().includes(query))
            );
            renderExpenses(filtered);
        });
    }
    
    // 4.3 EXPORT CSV FUNCTIONALITY
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

            showNotification("csvMessage", "CSV exported successfully!");
        });
    }

    // 4.4 SAVE BUDGET EVENT LISTENER
    if (saveBudgetBtn && budgetInput) {
        saveBudgetBtn.addEventListener("click", () => {
            const val = parseFloat(budgetInput.value);
            if (isNaN(val) || val < 0) {
                showNotification("budgetMessage", "Please enter a valid monthly budget!", true);
                return;
            }

            localStorage.setItem("monthly_budget", val.toFixed(2));
            showNotification("budgetMessage", "Monthly budget saved successfully!");
            checkBudgetWarning();
        });
    }

    // 4.5 RESET BUDGET EVENT LISTENER
    if (resetBudgetBtn && budgetInput) {
        resetBudgetBtn.addEventListener("click", () => {
            localStorage.removeItem("monthly_budget");
            budgetInput.value = "";
            showNotification("budgetMessage", "Monthly budget reset.");
            checkBudgetWarning();
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
        if (!confirmed) return;

        try {
            await fetchAPI(`/expenses/${id}`, {
                method: "DELETE"
            });
            await loadExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    }

    // 8. EDIT EXPENSE MODAL & PUT LOGIC
    let currentEditingExpenseId = null;
    const editModal = document.getElementById("editExpenseModal");
    const editForm = document.getElementById("editExpenseForm");
    const editCategorySelect = document.getElementById("editCategory");
    const closeEditModalBtn = document.getElementById("closeEditModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    function openEditModal(exp) {
        currentEditingExpenseId = exp.id;
        
        editCategorySelect.innerHTML = "";
        allCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            if (cat.id === exp.category_id) {
                option.selected = true;
            }
            editCategorySelect.appendChild(option);
        });

        document.getElementById("editAmount").value = exp.amount;
        document.getElementById("editDescription").value = exp.description || "";

        if (editModal) {
            editModal.classList.remove("hidden");
        }
    }

    function closeEditModal() {
        currentEditingExpenseId = null;
        if (editModal) {
            editModal.classList.add("hidden");
        }
        if (editForm) {
            editForm.reset();
        }
    }

    if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentEditingExpenseId) return;

            const amount = parseFloat(document.getElementById("editAmount").value);
            const category_id = parseInt(editCategorySelect.value, 10);
            const description = document.getElementById("editDescription").value.trim();
            const submitBtn = editForm.querySelector("button[type='submit']");

            if (!Number.isFinite(amount) || amount <= 0) {
                showNotification("editExpenseMessage", "Please enter a valid amount.", true);
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Updating...";

                await fetchAPI(`/expenses/${currentEditingExpenseId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        amount: amount,
                        category_id: category_id,
                        description: description
                    })
                });

                closeEditModal();
                await loadExpenses();
                showNotification("expenseMessage", "Expense updated successfully!");

            } catch (error) {
                console.error("Error updating expense:", error);
                showNotification("editExpenseMessage", "Error updating expense: " + error.message, true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save Changes";
            }
        });
    }
    
    // 9. INITIALIZE THE DASHBOARD
    await Promise.all([
        loadCategories(),
        loadExpenses()
    ]);
});

// Export for Jest testing if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = {};
}