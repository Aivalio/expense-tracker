"""File for testing Auth endpoints"""
def test_register_user(client):
    """Test 201 Created for a new user."""
    response = client.post("/auth/register", json={
        "email": "nikos@test.com",
        "password": "password123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "nikos@test.com"


def test_register_duplicate_email(client, test_user):
    """Tests that you cannot register a user with duplicate email."""
    response = client.post("/auth/register", json={
        "email": "nikos@test.com",
        "password": "password123"
    })
    assert response.status_code == 400


def test_login_user(client, test_user):
    """Test login for an existing user."""
    response = client.post("/auth/login", data={
        "username": "nikos@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_get_me(client, test_user):
    """Test getting current user data using the JWT token."""
    response = client.get("/auth/me", headers=test_user)
    assert response.status_code == 200
    assert response.json()["email"] == "nikos@test.com"




