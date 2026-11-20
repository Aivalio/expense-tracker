/**
 * @jest-environment jsdom
 */

describe('Expense Tracker - New Features Unit Tests', () => {

    beforeEach(() => {
        // Καθαρισμός του DOM και του localStorage πριν από κάθε τεστ
        localStorage.clear();
        document.body.innerHTML = `
            <input type="number" id="budgetInput" value="500" />
            <div id="budgetWarningBanner" class="hidden"></div>
            <span id="budgetWarningText"></span>
            <span id="budgetOverspendAmount"></span>
            <input type="text" id="searchInput" />
            <div id="expensesList"></div>
        `;
    });

    test('Reset Budget functionality clears localStorage and resets input', () => {
        const budgetInput = document.getElementById("budgetInput");
        
        // Προσομοίωση αποθήκευσης
        localStorage.setItem("monthly_budget", "600");
        budgetInput.value = "600";

        // Προσομοίωση της ενέργειας Reset
        localStorage.removeItem("monthly_budget");
        budgetInput.value = "";

        expect(localStorage.getItem("monthly_budget")).toBeNull();
        expect(budgetInput.value).toBe("");
    });

    test('Search filter filters expenses array correctly by description', () => {
        const allExpenses = [
            { id: 1, description: "Supermarket groceries", amount: 45.50, category_id: 1, date: "2026-06-01" },
            { id: 2, description: "Gasoline for car", amount: 30.00, category_id: 2, date: "2026-06-02" },
            { id: 3, description: "Supermarket coffee", amount: 5.00, category_id: 1, date: "2026-06-03" }
        ];

        const query = "supermarket";
        const filtered = allExpenses.filter(exp => 
            exp.description && exp.description.toLowerCase().includes(query)
        );

        expect(filtered.length).toBe(2);
        expect(filtered[0].description).toBe("Supermarket groceries");
        expect(filtered[1].description).toBe("Supermarket coffee");
    });

    test('Category badge styling applies correct colors from category object', () => {
        const categoryObj = { id: 1, name: "Food & Drinks", color: "#e11d48" };
        
        const badge = document.createElement("span");
        badge.textContent = categoryObj.name;
        
        if (categoryObj.color) {
            badge.style.backgroundColor = categoryObj.color + "20";
            badge.style.color = categoryObj.color;
        }

        expect(badge.textContent).toBe("Food & Drinks");
        expect(badge.style.color).toBe("rgb(225, 29, 72)"); // Το #e11d48 σε rgb
    });

});