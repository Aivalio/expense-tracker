"""Service file that contains the authentication logic: user lookup and creation"""
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models import User
from app.schemas import UserCreate


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user with a hashed password."""
    db_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password), # <-- Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ
        full_name=user_in.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> User | None:
    """Function that retrieves a user with a specific email"""
    return db.query(User).filter(User.email == email).first()