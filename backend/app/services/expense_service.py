"""Expense Service: business logic."""
from typing import Optional
from pydantic_core.core_schema import deque_schema
from sqlalchemy.orm import Session
from datetime import date
from app.models import User, Category, Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate



def get_expenses(db: Session, user: User, start_date: Optional[date] = None, end_date: Optional[date] = None) -> list[Expense]:
    """Function that returns all expenses belonging to the newest user"""
    query = db.query(Expense).filter(Expense.user_id == user.id)
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
        
    return query.order_by(Expense.date.desc()).all() # Return the expenses ordered by date in descending order


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


def delete_expense(db: Session, user: User, expense_id: int) -> bool:
    """Function that deletes an expense if it belongs to the user.

    Raises:
        ValueError: If the expense does not exist or does not belong to the user.
    """
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id
    ).first()

    if not expense:
        raise ValueError("Expense not found or does not belong to you.")

    db.delete(expense)
    db.commit()
    return True



def update_expense(db: Session, user: User, expense_id: int, expense_in: ExpenseUpdate) -> Expense:
    """Function that updates an expense if it belongs to the user."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id).first()
    
    if not expense:
        raise ValueError("Expense not found or does not belong to you.")
    
    # Get the data provided by the user, None is ignored
    updated_data = expense_in.model_dump(exclude_unset=True)
    
    for key, value in updated_data.items():
        setattr(expense, key, value) # Set the attribute of the expense object to the new value
        
    db.commit()
    db.refresh(expense)
    return expense
