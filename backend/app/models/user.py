from sqlalchemy import Boolean, Column, String, Integer, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class UserAvailability(str, enum.Enum):
    WEEKDAYS = "weekdays"
    WEEKENDS = "weekends"
    EVENINGS = "evenings"
    MORNINGS = "mornings"
    ANYTIME = "anytime"


class ProfileVisibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    location = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)  # Path to profile photo
    bio = Column(Text, nullable=True)
    
    # User preferences
    availability = Column(Enum(UserAvailability), default=UserAvailability.ANYTIME)
    visibility = Column(Enum(ProfileVisibility), default=ProfileVisibility.PUBLIC)
    
    # User role
    role = Column(Enum(UserRole), default=UserRole.USER)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    skills_offered = relationship("SkillOffered", back_populates="user", cascade="all, delete-orphan")
    skills_wanted = relationship("SkillWanted", back_populates="user", cascade="all, delete-orphan")
    
    # Swap relationships
    sent_swaps = relationship("Swap", foreign_keys="Swap.requester_id", back_populates="requester")
    received_swaps = relationship("Swap", foreign_keys="Swap.provider_id", back_populates="provider")
    
    # Feedback relationships
    given_feedback = relationship("Feedback", foreign_keys="Feedback.giver_id", back_populates="giver")
    received_feedback = relationship("Feedback", foreign_keys="Feedback.receiver_id", back_populates="receiver")
