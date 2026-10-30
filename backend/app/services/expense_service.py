"""Expense Service: business logic."""
from pydantic_core.core_schema import deque_schema
from sqlalchemy.orm import Session
from datetime import date
from app.models import User, Category, Expense
from app.schemas.expense import ExpenseCreate



def get_expenses(db: Session, user: User) -> list[Expense]:
    """Function that returns all expenses belonging to the newest user"""
    return db.query(Expense).filter(Expense.user_id == user.id).order_by(Expense.date.desc()).all()


def create_expense(db: Session, user: User, expense_in: ExpenseCreate) -> Expense:
    """Functions that creates a new expense for a user.

    Raises:
        ValueError: If the category does not exist or does not belong to the user.
    """
    # Security checking that the category belongs indeed to the user
    category = db.query(Category).filter(
        Category.id == expense_in.category_id,
        Category.user_id == user.id
    ).first()

    if not category:
        raise ValueError("Category not found or does not belong to you.")

    # Create a new expense
    expense = Expense(
        user_id=user.id,
        category_id=category.id,  # <-- Παίρνουμε το ID από την κατηγορία που βρήκαμε
        amount=expense_in.amount,
        description=expense_in.description,
        date=expense_in.date or date.today()
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense