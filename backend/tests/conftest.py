"""Shared test fixtures."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User, Category, Expense


# Create an in-memory SQLite database for the tests
SQLALCHEMY_DATABASE_URL = "sqlite:///db.sqlite3"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine)


# Replace/Override the project database with a test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def setup_db():
    """Create tables before testing them and then delete them"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Create and configure a rest client"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def test_user(client):
    """Create a user, log him in and return the token."""
    user_data = {
        "email": "nikos@test.com",
        "password": "password123",
        "full_name": "Test User",
    }
    client.post("/auth/register", json=user_data)

    login_data = {
        "email": "nikos@test.com",
        "password": "password123",
    }

    response = client.post("/auth/login", json=login_data)
    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
