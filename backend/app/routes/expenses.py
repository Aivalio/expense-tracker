"""Expense API routes"""
from fastapi import Depends, HTTPException, status, APIRouter, Query
from sqlalchemy.orm import Session

from typing import Optional
from datetime import date

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expense_service import create_expense, get_expenses, delete_expense, update_expense


router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=list[ExpenseResponse])
def read_expenses(
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"), end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Function that returns an expense list"""
    return get_expenses(db, user, start_date=start_date, end_date=end_date)


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


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_expense(
        expense_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Function that removes an expense from the database"""
    try:
        return delete_expense(db, current_user, expense_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e))
        
        
@router.put("/{expense_id}", response_model=ExpenseResponse)
def modify_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_expense(db, current_user, expense_id, expense_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))
