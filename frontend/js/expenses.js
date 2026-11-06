document.addEventListener("DOMContentLoaded", async () => {
    const expenseForm = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("category");
    const expensesList = document.getElementById("expensesList");
    
    // If the token does not exist, redirect to login page
    const token = localStorage.getItem("access_token");
    if (!token) return; 

    // Load the categories from the Backend
    async function loadCategories() {
        try {
            const categories = await fetchAPI("/categories/");
            
            // Clear out the dropdown before populating it
            categorySelect.innerHTML = '<option value="">Select a category</option>';
            
            if (categories.length === 0) {
                categorySelect.innerHTML = '<option value="">No categories found. Create one first!</option>';
                return;
            }

            // Fill in the dropdown with categories
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }

    // Load the expenses from the Backend
    async function loadExpenses() {
        try {
            const expenses = await fetchAPI("/expenses/");
            expensesList.innerHTML = ""; // Καθαρίζουμε τη λίστα

            if (expenses.length === 0) {
                expensesList.innerHTML = '<p class="text-gray-500 text-center py-4">No expenses yet. Add one on the left!</p>';
                return;
            }

            // Create a div for each expense and append it to the list
            expenses.forEach(exp => {
                const div = document.createElement("div");
                div.className = "flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-2 hover:bg-gray-50 transition-colors";
                
                div.innerHTML = `
                    <div>
                        <p class="font-bold text-gray-800">${exp.description || 'Expense'}</p>
                        <p class="text-xs text-gray-500 mt-1">📅 ${exp.date}</p>
                    </div>
                    <div class="text-lg font-bold text-red-600">
                        -€${parseFloat(exp.amount).toFixed(2)}
                    </div>
                `;
                expensesList.appendChild(div);
            });
        } catch (error) {
            console.error("Error loading expenses:", error);
            expensesList.innerHTML = '<p class="text-red-500">Failed to load expenses.</p>';
        }
    }

    // Submit a new expense
    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Σταματάμε το refresh
            
            const amount = parseFloat(document.getElementById("amount").value);
            const category_id = parseInt(categorySelect.value);
            const description = document.getElementById("description").value;

            if (!category_id) {
                alert("Please select a category first!");
                return;
            }

            try {
                // Send the data to the API
                await fetchAPI("/expenses/", {
                    method: "POST",
                    body: JSON.stringify({ 
                        amount: amount, 
                        category_id: category_id, 
                        description: description 
                    })
                });
                
                // If successful: Clear the form and refresh the list
                expenseForm.reset();
                loadExpenses();
                
            } catch (error) {
                alert("Error adding expense: " + error.message);
            }
        });
    }

    // Execute the functions while the page is loading 
    loadCategories();
    loadExpenses();
});