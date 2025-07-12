from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

from ..models.swap import SwapStatus
from .user import UserPublic
from .skill import SkillOfferedInDB, SkillWantedInDB


# Base Swap Schema
class SwapBase(BaseModel):
    provider_id: int
    skill_offered_id: int
    skill_wanted_id: Optional[int] = None
    message: Optional[str] = None


# Schema for creating a swap
class SwapCreate(SwapBase):
    pass


# Schema for updating a swap
class SwapUpdate(BaseModel):
    status: SwapStatus
    message: Optional[str] = None


# Schema for swap in DB
class SwapInDB(BaseModel):
    id: int
    requester_id: int
    provider_id: int
    skill_offered_id: Optional[int] = None
    skill_wanted_id: Optional[int] = None
    message: Optional[str] = None
    status: SwapStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for swap with related data
class SwapWithDetails(SwapInDB):
    requester: UserPublic
    provider: UserPublic
    skill_offered: Optional[SkillOfferedInDB] = None
    skill_wanted: Optional[SkillWantedInDB] = None
    
    class Config:
        from_attributes = True


# Base Feedback Schema
class FeedbackBase(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    
    @field_validator('rating')
    @classmethod
    def rating_must_be_valid(cls, v):
        if not (1 <= v <= 5):
            raise ValueError('Rating must be between 1 and 5')
        return v


# Schema for creating feedback
class FeedbackCreate(FeedbackBase):
    swap_id: int
    receiver_id: int


# Schema for feedback in DB
class FeedbackInDB(FeedbackBase):
    id: int
    swap_id: int
    giver_id: int
    receiver_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for feedback with related data
class FeedbackWithDetails(FeedbackInDB):
    giver: UserPublic
    receiver: UserPublic
    
    class Config:
        from_attributes = True
