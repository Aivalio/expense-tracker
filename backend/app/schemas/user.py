"""Pydantic schemas for the User."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    """A Schema for the User Registration."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name : str | None = Field(None, max_length=100)


class UserLogin(BaseModel):
    """A Schema for the User Login and Password."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """A Schema for returning user data."""
    id: int
    email: EmailStr
    full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
