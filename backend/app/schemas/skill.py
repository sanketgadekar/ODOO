from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from ..models.skill import SkillStatus


# Base Skill Schema
class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None


# Schema for creating a skill offered
class SkillOfferedCreate(SkillBase):
    pass


# Schema for updating a skill offered
class SkillOfferedUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SkillStatus] = None


# Schema for skill offered in DB
class SkillOfferedInDB(SkillBase):
    id: int
    user_id: int
    status: SkillStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for creating a skill wanted
class SkillWantedCreate(SkillBase):
    pass


# Schema for updating a skill wanted
class SkillWantedUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# Schema for skill wanted in DB
class SkillWantedInDB(SkillBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Schema for skill search
class SkillSearch(BaseModel):
    query: str = Field(..., min_length=1)
    skill_type: Optional[str] = Field(None, pattern='^(offered|wanted)$')


# Schema for skill search result
class SkillSearchResult(BaseModel):
    skill_id: int
    skill_type: str  # "offered" or "wanted"
    name: str
    description: Optional[str] = None
    user_id: int
    username: str
    user_name: str
    
    class Config:
        from_attributes = True
