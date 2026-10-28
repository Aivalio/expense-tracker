"""Pydantic Schema for creating a category."""
from pydantic import BaseModel, Field
from datetime import date


class ExpenseCreate(BaseModel):
    """Class for creating a category."""
    amount: float = Field(gt=0, description="Amount of expense must be greater than 0")
    category_id: int
    date: date | None = None
    description: str | None = None


class ExpenseResponse(BaseModel):
    """Class for returning expense data."""
    id: int
    amount: float
    category_id: int
    date: date
    description: str | None = None

    class Config:
        from_attributes = True