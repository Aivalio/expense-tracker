"""Shared test fixtures."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import User, Category, Expense


@pytest.fixture(scope="function")
def db_session(tmp_path):
    """Create a fresh database for each test using a temp file."""
    db_file = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    engine.dispose()


@pytest.fixture
def client(db_session):
    """Create and configure a rest client."""
    with TestClient(app) as c:
        yield c


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
        "username": "nikos@test.com",
        "password": "password123",
    }
    response = client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}