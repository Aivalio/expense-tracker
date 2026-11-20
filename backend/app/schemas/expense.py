"""Pydantic Schema for creating a category."""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
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
    
    model_config = ConfigDict(from_attributes=True)
    

class ExpenseUpdate(BaseModel):
    """Schema for updating an expense."""
    amount: Optional[float] = Field(gt=0, description="Amount of expense must be greater than 0")
    category_id: Optional[int] = None
    description: Optional[str] = None
    date: Optional[dt.date] = None