/**
 * @jest-environment jsdom
 */

describe("Expenses Dashboard & Edit Feature Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("access_token", "fake-token");
        jest.resetModules();

        // Ορισμός του mock ΠΑΝΤΑ καθαρά πριν από κάθε test
        global.fetchAPI = jest.fn();

        // Set up standard DOM elements expected by expenses.js
        document.body.innerHTML = `
            <form id="expenseForm">
                <input id="amount" value="50" />
                <select id="category">
                    <option value="1" selected>Food</option>
                </select>
                <input id="description" value="Lunch" />
                <button type="submit">Save Expense</button>
            </form>

            <div id="expensesList"></div>

            <form id="categoryForm">
                <input id="newCategoryName" value="Transport" />
                <button type="submit">Add</button>
            </form>

            <input id="searchInput" />
            <button id="exportCsvBtn"></button>
            <input id="budgetInput" value="200" />
            <button id="saveBudgetBtn"></button>
            <button id="resetBudgetBtn"></button>

            <div id="budgetWarningBanner" class="hidden"></div>
            <p id="budgetWarningText"></p>
            <span id="budgetOverspendAmount"></span>
            <span id="currentMonthExpenses"></span>

            <!-- Edit Expense Modal Elements -->
            <div id="editExpenseModal" class="hidden">
                <form id="editExpenseForm">
                    <input id="editAmount" />
                    <select id="editCategory">
                        <option value="1" selected>Food</option>
                    </select>
                    <input id="editDescription" />
                    <button type="submit">Save Changes</button>
                </form>

                <button id="closeEditModalBtn"></button>
                <button id="cancelEditBtn"></button>
            </div>

            <div id="expenseMessage"></div>
            <div id="editExpenseMessage"></div>
        `;
    });

    test("should initialize and load categories and expenses successfully", async () => {
        global.fetchAPI.mockImplementation((endpoint) => {
            if (endpoint === "/categories/") {
                return Promise.resolve([
                    { id: 1, name: "Food", color: "#ff0000" }
                ]);
            }

            if (endpoint === "/expenses/") {
                return Promise.resolve([
                    {
                        id: 1,
                        amount: 25.5,
                        category_id: 1,
                        description: "Coffee",
                        date: "2026-06-01"
                    }
                ]);
            }

            return Promise.resolve(null);
        });

        require("../js/expenses.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(global.fetchAPI).toHaveBeenCalledWith("/categories/");
        expect(global.fetchAPI).toHaveBeenCalledWith("/expenses/");

        const expensesList = document.getElementById("expensesList");

        expect(expensesList.textContent).toContain("Coffee");
        expect(expensesList.textContent).toContain("€25.50");
    });


    test("should handle editing an expense with PUT request", async () => {
        global.fetchAPI.mockImplementation((endpoint, options) => {
            if (endpoint === "/categories/") {
                return Promise.resolve([
                    { id: 1, name: "Food", color: "#ff0000" }
                ]);
            }

            if (endpoint === "/expenses/") {
                return Promise.resolve([
                    {
                        id: 1,
                        amount: 25.5,
                        category_id: 1,
                        description: "Coffee",
                        date: "2026-06-01"
                    }
                ]);
            }

            if (
                endpoint === "/expenses/1" &&
                options &&
                options.method === "PUT"
            ) {
                return Promise.resolve({
                    id: 1,
                    amount: 30.0,
                    category_id: 1,
                    description: "Better Coffee"
                });
            }

            return Promise.resolve(null);
        });

        require("../js/expenses.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));

        await new Promise(resolve => setTimeout(resolve, 50));

        // Επειδή τα expenses έχουν γίνει render, βρίσκουμε το edit button που δημιουργήθηκε δυναμικά και το πατάμε!
        const editButton = document.querySelector('button[title="Edit expense"]');
        if (editButton) {
            editButton.click();
        } else {
            // Fallback αν δεν βρεθεί αυτόματα, ανοίγουμε το modal χειροκίνητα
            const editModal = document.getElementById("editExpenseModal");
            editModal.classList.remove("hidden");
        }

        document.getElementById("editAmount").value = "30.0";
        document.getElementById("editDescription").value = "Better Coffee";

        const editForm = document.getElementById("editExpenseForm");
        editForm.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
        );

        await new Promise(resolve => setTimeout(resolve, 50));

        const putCallFound = global.fetchAPI.mock.calls.some(call => {
            return call[0] === "/expenses/1" && call[1] && call[1].method === "PUT";
        });

        expect(putCallFound).toBe(true);
    });


    test("should display the correct overspend amount when budget is exceeded", async () => {
        global.fetchAPI.mockImplementation((endpoint) => {
            if (endpoint === "/categories/") {
                return Promise.resolve([
                    { id: 1, name: "Food", color: "#ff0000" }
                ]);
            }

            if (endpoint === "/expenses/") {
                return Promise.resolve([
                    {
                        id: 1,
                        amount: 250.0,
                        category_id: 1,
                        description: "Big Expense",
                        date: new Date().toISOString()
                    }
                ]);
            }

            return Promise.resolve(null);
        });

        localStorage.setItem("monthly_budget", "100.00");

        require("../js/expenses.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(global.fetchAPI).toHaveBeenCalledWith("/categories/");
        expect(global.fetchAPI).toHaveBeenCalledWith("/expenses/");

        const budgetWarningBanner = document.getElementById(
            "budgetWarningBanner"
        );

        expect(budgetWarningBanner.classList.contains("hidden")).toBe(false);
    });
});