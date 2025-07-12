from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..database import Base


class SwapStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Swap(Base):
    __tablename__ = "swaps"

    id = Column(Integer, primary_key=True, index=True)
    
    # Participants
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Skills involved
    skill_offered_id = Column(Integer, ForeignKey("skills_offered.id", ondelete="SET NULL"), nullable=True)
    skill_wanted_id = Column(Integer, ForeignKey("skills_wanted.id", ondelete="SET NULL"), nullable=True)
    
    # Swap details
    message = Column(Text, nullable=True)
    status = Column(Enum(SwapStatus), default=SwapStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_swaps")
    provider = relationship("User", foreign_keys=[provider_id], back_populates="received_swaps")
    skill_offered = relationship("SkillOffered", back_populates="swaps")
    skill_wanted = relationship("SkillWanted", back_populates="swaps")
    feedback = relationship("Feedback", back_populates="swap", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    swap_id = Column(Integer, ForeignKey("swaps.id", ondelete="CASCADE"), nullable=False)
    
    # Participants
    giver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Feedback details
    rating = Column(Float, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    swap = relationship("Swap", back_populates="feedback")
    giver = relationship("User", foreign_keys=[giver_id], back_populates="given_feedback")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_feedback")
