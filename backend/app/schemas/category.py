"""Pydantic schemas for category model"""
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Schema for creating a category."""
    name: str = Field(min_length=1, max_length=50)
    color: str = Field(default="#6366f1", pattern="^#[0-9a-fA-F]{6}$")


class CategoryResponse(BaseModel):
    """Schema for returning category data."""
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True
