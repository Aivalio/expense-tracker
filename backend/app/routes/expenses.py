"""Expense API routes"""
from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import create_expense, get_expenses


router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("/", response_model=list[ExpenseResponse])
def read_expenses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Function that returns an expense list"""
    return get_expenses(db, user)


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(
        expense_in : ExpenseCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Function that adds an expense to the database"""
    try:
        return create_expense(db, current_user, expense_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))
