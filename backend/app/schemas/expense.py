"""Pydantic Schema for creating a category."""
from pydantic import BaseModel, Field
import datetime as dt


class ExpenseCreate(BaseModel):
    """Class for creating a category."""
    amount: float = Field(gt=0, description="Amount of expense must be greater than 0")
    category_id: int
    date: dt.date | None = None
    description: str | None = None


class ExpenseResponse(BaseModel):
    """Class for returning expense data."""
    id: int
    amount: float
    category_id: int
    date: dt.date
    description: str | None = None

    class Config:
        from_attributes = True