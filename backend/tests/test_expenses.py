"""Tests for Expense and Category endpoints."""
def test_create_category(client, test_user):
    response = client.post("/categories/", json={
        "name": "Food",
        "color": "#ff0000"
    }, headers=test_user)
    assert response.status_code == 201
    assert response.json()["name"] == "Food"


def test_create_expense(client, test_user):
    # Create an expense category first
    cat_res = client.post("/categories/", json={
        "name": "Transport", "color": "#0000ff"
    }, headers=test_user)

    # Debugging lines 
    print("\n--- DEBUG CATEGORY RESPONSE ---")
    print(cat_res.status_code)
    print(cat_res.json())
    print("-------------------------------\n")

    # Get the ID from the JSON response
    category_id = cat_res.json()["id"]

    # Create a response output
    response = client.post("/expenses/", json={
        "amount": 15.50,
        "category_id": category_id,
        "description": "Bus ticket"
    }, headers=test_user)

    # Print what the server says for debugging 
    if response.status_code != 201:
        print("\n--- DEBUG EXPENSE ERROR ---")
        print(response.json())
        print("---------------------------\n")

    assert response.status_code == 201
    assert response.json()["amount"] == 15.50


def test_create_expense_invalid_category(client, test_user):
    response = client.post("/expenses/", json={
        "amount": 10.00,
        "category_id": 9999,
        "description": "Invalid"
    }, headers=test_user)
    assert response.status_code == 400
    
    
def test_filter_expenses_by_date(client, test_user):
    """Test filtering expenses by start_date and end_date."""
    # Create a category first
    cat_res = client.post("/categories/", json={
        "name": "Food", "color": "#ff0000"
    }, headers=test_user)
    category_id = cat_res.json()["id"]

    # Create an expense (it will use the current date by default)
    client.post("/expenses/", json={
        "amount": 50.00,
        "category_id": category_id,
        "description": "Dinner"
    }, headers=test_user)

    # Test filter with a date range that includes today (e.g., current year range)
    response = client.get("/expenses/?start_date=2026-01-01&end_date=2026-12-31", headers=test_user)
    
    assert response.status_code == 200
    expenses = response.json()
    assert isinstance(expenses, list)
    assert len(expenses) >= 1
    assert expenses[0]["description"] == "Dinner"

    # Test filter with a date range in the past (should return empty list)
    response_empty = client.get("/expenses/?start_date=2020-01-01&end_date=2020-01-31", headers=test_user)
    
    assert response_empty.status_code == 200
    assert len(response_empty.json()) == 0
    
    
def test_delete_category_cascades_expenses(client, test_user):
    """Test that deleting a category also deletes associated expenses."""
    
    # Create a category
    cat_res = client.post("/categories/", json={
        "name": "Utilities", "color": "#00ff00"
    }, headers=test_user)
    assert cat_res.status_code == 201
    category_id = cat_res.json()["id"]

    # Create an expense under this category
    exp_res = client.post("/expenses/", json={
        "amount": 100.00,
        "category_id": category_id,
        "description": "Electricity bill"
    }, headers=test_user)
    assert exp_res.status_code == 201
    expense_id = exp_res.json()["id"]
    
    # Delete the category
    del_res = client.delete(f"/categories/{category_id}", headers=test_user)
    assert del_res.status_code == 204

    # Check that the expense is also deleted via cascade
    get_exp_res = client.get("/expenses/", headers=test_user)
    expenses = get_exp_res.json()
    assert all(e["id"] != expense_id for e in expenses)