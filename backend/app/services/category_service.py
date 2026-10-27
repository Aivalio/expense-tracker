"""Category service: holds the business logic for creating a category."""
from sqlalchemy.orm import Session
from app.models import Category, User
from app.schemas.category import CategoryCreate


def get_categories(db: Session, user: User) -> list[Category]:
    """Function to get all categories that belong to a user."""
    return db.query(Category).filter(Category.user_id == user.id).all()


def create_category(db: Session, user: User, category_in: CategoryCreate) -> Category:
    """Create a new category for the user.

    Raises:
        ValueError: If the user already has a category with this name.
    """
    existing = db.query(Category).filter(
        Category.user_id == user.id,
        Category.name == category_in.name
    ).first()

    if existing:
        raise ValueError(f"Category with name {category_in.name} already exists")

    category = Category(
        user_id = user.id,
        name = category_in.name,
        color = category_in.color,
    )

    db.add(category)
    db.commit()
    db.refresh(category)
    return category
