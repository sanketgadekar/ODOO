from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

from ..models.user import UserRole, UserAvailability, ProfileVisibility


# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    username: str
    name: str
    location: Optional[str] = None
    bio: Optional[str] = None
    availability: UserAvailability = UserAvailability.ANYTIME
    visibility: ProfileVisibility = ProfileVisibility.PUBLIC


# Schema for creating a user
class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


# Schema for updating a user
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    availability: Optional[UserAvailability] = None
    visibility: Optional[ProfileVisibility] = None
    password: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


# Schema for user in DB
class UserInDB(UserBase):
    id: int
    profile_photo: Optional[str] = None
    role: UserRole
    is_active: bool
    is_banned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for public user data
class UserPublic(BaseModel):
    id: int
    username: str
    name: str
    location: Optional[str] = None
    profile_photo: Optional[str] = None
    bio: Optional[str] = None
    availability: UserAvailability
    created_at: datetime
    
    class Config:
        from_attributes = True


# Schema for user profile
class UserProfile(UserPublic):
    email: EmailStr
    visibility: ProfileVisibility
    role: UserRole
    is_active: bool
    is_banned: bool
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema for token
class Token(BaseModel):
    access_token: str
    token_type: str


# Schema for token data
class TokenData(BaseModel):
    user_id: Optional[int] = None
