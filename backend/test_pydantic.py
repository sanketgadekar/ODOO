from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserAvailability(str, Enum):
    WEEKDAYS = "weekdays"
    WEEKENDS = "weekends"
    EVENINGS = "evenings"
    MORNINGS = "mornings"
    ANYTIME = "anytime"


class ProfileVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class UserBase(BaseModel):
    username: str
    name: str
    location: Optional[str] = None
    bio: Optional[str] = None
    availability: UserAvailability = UserAvailability.ANYTIME
    visibility: ProfileVisibility = ProfileVisibility.PUBLIC


class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserInDB(UserBase):
    id: int
    profile_photo: Optional[str] = None
    role: UserRole
    is_active: bool
    is_banned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }


class SkillSearch(BaseModel):
    query: str = Field(..., min_length=1)
    skill_type: Optional[str] = Field(None, pattern='^(offered|wanted)$')


# Test UserCreate
user_create = UserCreate(
    username="testuser",
    name="Test User",
    password="password123"
)
print("UserCreate validation successful")

# Test UserInDB
user_in_db = UserInDB(
    id=1,
    username="testuser",
    name="Test User",
    role=UserRole.USER,
    is_active=True,
    is_banned=False,
    created_at=datetime.now()
)
print("UserInDB validation successful")

# Test SkillSearch
skill_search = SkillSearch(
    query="programming",
    skill_type="offered"
)
print("SkillSearch validation successful")

print("All validations successful!") 