// Wait until the HTML document has completely loaded
document.addEventListener("DOMContentLoaded", async () => {

    // 1. GET HTML ELEMENTS
    const expenseForm = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("category");
    const expensesList = document.getElementById("expensesList");

    const categoryForm = document.getElementById("categoryForm");


    
    // 2. CHECK USER AUTHENTICATION
    // Get the authentication token from localStorage
    const token = localStorage.getItem("access_token");

    // Stop execution if the user is not authenticated
    if (!token) {
        window.location.href = "login.html";
        return;
    }


    
    // 3. LOAD CATEGORIES FROM THE BACKEND
    async function loadCategories() {

        try {
            // Request all available categories from the API
            const categories = await fetchAPI("/categories/");

            // Clear the dropdown before adding new options
            categorySelect.innerHTML =
                '<option value="">Select a category</option>';

            // Check whether any categories exist
            if (!categories || categories.length === 0) {
                categorySelect.innerHTML =
                    '<option value="">No categories found. Create one first!</option>';
                return;
            }

            // Add each category to the dropdown menu
            categories.forEach((cat) => {
                const option = document.createElement("option");
                // Set the category ID as the option value
                option.value = cat.id;
                // Display the category name to the user
                option.textContent = cat.name;
                categorySelect.appendChild(option);

            });
        } catch (error) {
            // Display an error if categories cannot be loaded
            console.error("Error loading categories:", error);
            categorySelect.innerHTML =
                '<option value="">Failed to load categories</option>';
        }
    }


    
    // 4. LOAD AND DISPLAY EXPENSES
    async function loadExpenses() {

        try {
            // Display a loading message while waiting for the API
            expensesList.innerHTML =
                '<p class="text-gray-500 text-center py-4">Loading expenses...</p>';

            // Request all expenses from the backend
            const expenses = await fetchAPI("/expenses/");

            // Clear the loading message
            expensesList.innerHTML = "";

            // Check whether the user has any expenses
            if (!expenses || expenses.length === 0) {
                expensesList.innerHTML =
                    '<p class="text-gray-500 text-center py-4">No expenses yet. Add one on the left!</p>';
                return;
            }

            // Loop through all expenses and display them
            expenses.forEach((exp) => {
                // Create a container for each expense
                const div = document.createElement("div");

                div.className =
                    "flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-2 hover:bg-gray-50 transition-colors";
                // Create the expense details section
                const details = document.createElement("div");

                // Display the expense description safely
                const description = document.createElement("p");

                description.className = "font-bold text-gray-800";
                description.textContent = exp.description || "Expense";

                // Display the expense date
                const date = document.createElement("p");

                date.className = "text-xs text-gray-500 mt-1";
                date.textContent = "📅 " + (exp.date || "Date unavailable");

                details.appendChild(description);
                details.appendChild(date);


                // Create the section containing the amount and delete button
                const actions = document.createElement("div");
                actions.className = "flex items-center space-x-4";


                // Display the expense amount in euros
                const amount = document.createElement("div");
                amount.className = "text-lg font-bold text-red-600";

                amount.textContent =
                    "-€" + Number(exp.amount).toFixed(2);


                // Create the delete button
                const deleteButton = document.createElement("button");

                deleteButton.className =
                    "text-gray-400 hover:text-red-600 transition-colors";
                deleteButton.title = "Delete expense";
                deleteButton.setAttribute("aria-label", "Delete expense");

                // Add the delete icon using SVG
                deleteButton.innerHTML = `
                    <svg class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>

                    </svg>
                `;

                // Delete the selected expense when the button is clicked
                deleteButton.addEventListener("click", () => {
                    deleteExpense(exp.id);
                });

                // Add the amount and delete button to the action section
                actions.appendChild(amount);
                actions.appendChild(deleteButton);


                // Combine all elements into the expense container
                div.appendChild(details);
                div.appendChild(actions);

                // Add the expense to the page
                expensesList.appendChild(div);

            });

        } catch (error) {

            // Display an error if expenses cannot be retrieved
            console.error("Error loading expenses:", error);

            expensesList.innerHTML =
                '<p class="text-red-500 text-center">Failed to load expenses.</p>';
        }
    }


    
    // 5. CREATE A NEW EXPENSE
    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {

            // Prevent the browser from refreshing the page
            e.preventDefault();

            // Get the values entered by the user
            const amount = parseFloat(
                document.getElementById("amount").value
            );

            const category_id = parseInt(categorySelect.value, 10);
            const description =
                document.getElementById("description").value.trim();


            // Get the form submission button
            const submitBtn = expenseForm.querySelector(
                "button[type='submit']"
            );

            // Validate the expense amount
            if (!Number.isFinite(amount) || amount <= 0) {
                alert("Please enter a valid expense amount.");

                return;
            }

            // Make sure a category has been selected
            if (!Number.isInteger(category_id)) {
                alert("Please select a category first!");
                return;
            }


            try {
                // Disable the button to prevent duplicate submissions
                submitBtn.disabled = true;
                submitBtn.textContent = "Saving...";


                // Send the new expense to the backend API
                await fetchAPI("/expenses/", {
                    method: "POST",
                    body: JSON.stringify({
                        amount: amount,
                        category_id: category_id,
                        description: description
                    })
                });


                // Clear the form after successful submission
                expenseForm.reset();


                // Reload the expenses list without refreshing the page
                await loadExpenses();


                alert("Expense added successfully!");

            } catch (error) {
                // Display an error if the expense cannot be saved
                console.error("Error adding expense:", error);

                alert("Error adding expense: " + error.message);
            } finally {

                // Re-enable the button after the operation finishes
                submitBtn.disabled = false;

                submitBtn.textContent = "Save Expense";
            }
        });

    }


    
    // 6. CREATE A NEW CATEGORY
    if (categoryForm) {
        categoryForm.addEventListener("submit", async (e) => {

            // Prevent the default form submission
            e.preventDefault();


            // Get the category name entered by the user
            const categoryName = document
                .getElementById("newCategoryName")
                .value
                .trim();


            // Make sure the category name is not empty
            if (!categoryName) {
                alert("Please enter a category name.");
                return;
            }


            // Get the category form submission button
            const categoryBtn = categoryForm.querySelector(
                "button[type='submit']"
            );

            try {

                categoryBtn.disabled = true;
                categoryBtn.textContent = "Adding...";


                // Generate a random hexadecimal color for the category
                const randomColor =
                    "#" +
                    Math.floor(Math.random() * 16777215)
                        .toString(16)
                        .padStart(6, "0");


                // Send the new category to the backend API
                await fetchAPI("/categories/", {

                    method: "POST",
                    body: JSON.stringify({
                        name: categoryName,
                        color: randomColor
                    })
                });


                // Clear the category form
                categoryForm.reset();

                // Reload the dropdown to include the new category
                await loadCategories();
                alert("Category created successfully!");

            } catch (error) {
                // Display an error if the category cannot be created
                console.error("Error creating category:", error);
                alert("Error creating category: " + error.message);

            } finally {
                // Restore the category button
                categoryBtn.disabled = false;

                categoryBtn.textContent = "Add";

            }

        });

    }


    // 7. DELETE AN EXPENSE
    async function deleteExpense(id) {

        // Ask the user to confirm before deleting the expense
        const confirmed = confirm(
            "Are you sure you want to delete this expense?"
        );
        if (!confirmed) {
            return;
        }

        try {
            // Send a DELETE request to the backend API
            await fetchAPI(`/expenses/${id}/`, {
                method: "DELETE"
            });


            // Reload the expenses list after successful deletion
            await loadExpenses();

            alert("Expense deleted successfully!");

        } catch (error) {
            // Display an error if the deletion fails
            console.error("Error deleting expense:", error);

            alert("Error deleting expense: " + error.message);

        }

    }


    
    // 8. INITIALIZE THE DASHBOARD
    // Load categories and expenses when the dashboard opens
    await Promise.all([
        loadCategories(),
        loadExpenses()
    ]);
});
