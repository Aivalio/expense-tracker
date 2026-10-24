"""Pydantic schemas foe JWT tokens."""
from pydantic import BaseModel


class Token(BaseModel):
    """Schema for JWT responses."""
    access_token: str
    token_type: str = 'bearer'
