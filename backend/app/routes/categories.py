"""Category routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category_service import create_category, get_categories

from app.models.category import Category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryResponse])
def read_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all categories for a user."""
    return get_categories(db, current_user)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def add_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new category."""
    try:
        return create_category(db, current_user, category_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

       
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a category and all its related expenses."""
    category = db.query(Category).filter_by(id=category_id, user_id=current_user.id).first()
    
    # Check if the category is valid 
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )
    
    db.delete(category)
    db.commit()
    
    return None



