"""Tests for Expense and Category endpoints."""
def test_create_category(client, test_user):
    response = client.post("/categories/", json={
        "name": "Food",
        "color": "#ff0000"
    }, headers=test_user)
    assert response.status_code == 201
    assert response.json()["name"] == "Food"


def test_create_expense(client, test_user):
    # 1. Φτιάχνουμε κατηγορία
    cat_res = client.post("/categories/", json={
        "name": "Transport", "color": "#0000ff"
    }, headers=test_user)

    # --- DEBUG: Ας δούμε τι επιστρέφει η κατηγορία ---
    print("\n--- DEBUG CATEGORY RESPONSE ---")
    print(cat_res.status_code)
    print(cat_res.json())
    print("-------------------------------\n")

    # 2. Παίρνουμε το ID από το JSON response
    category_id = cat_res.json()["id"]

    # 3. Φτιάχνουμε το έξοδο
    response = client.post("/expenses/", json={
        "amount": 15.50,
        "category_id": category_id,
        "description": "Bus ticket"
    }, headers=test_user)

    # --- DEBUG: Ας δούμε τι λέει ο server αν αποτύχει ---
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