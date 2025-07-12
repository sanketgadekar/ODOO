from typing import Any, List
import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..core.auth import get_current_user, get_password_hash
from ..database import get_db
from ..models.user import User, ProfileVisibility
from ..schemas.user import UserProfile, UserUpdate, UserPublic
from ..config import settings

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user profile
    """
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update current user profile
    """
    # Check if email is being updated and already exists
    if user_update.email and user_update.email != current_user.email:
        if db.query(User).filter(User.email == user_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username is being updated and already exists
    if user_update.username and user_update.username != current_user.username:
        if db.query(User).filter(User.username == user_update.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user data
    update_data = user_update.dict(exclude_unset=True)
    
    # Hash password if it's being updated
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    # Update user object
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/me/profile-photo", response_model=UserProfile)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Upload profile photo
    """
    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB"
        )
    
    # Check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File type not supported. Please upload a JPEG, PNG, or GIF image."
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"user_{current_user.id}_profile.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Write file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Update user profile
    current_user.profile_photo = f"/static/uploads/{filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get user profile by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user profile is private
    if user.visibility == ProfileVisibility.PRIVATE and user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This profile is private"
        )
    
    return user


@router.get("/", response_model=List[UserPublic])
async def search_users(
    query: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Search users by name or username
    """
    if not query:
        # Return all public users
        users = db.query(User).filter(
            User.visibility == ProfileVisibility.PUBLIC,
            User.is_active == True,
            User.is_banned == False
        ).all()
    else:
        # Search by name or username
        users = db.query(User).filter(
            or_(
                User.name.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%")
            ),
            User.visibility == ProfileVisibility.PUBLIC,
            User.is_active == True,
            User.is_banned == False
        ).all()
    
    return users
