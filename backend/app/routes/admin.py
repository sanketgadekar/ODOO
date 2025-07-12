from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from ..core.auth import get_current_admin_user
from ..database import get_db
from ..models.user import User, UserRole
from ..models.skill import SkillOffered, SkillWanted, SkillStatus
from ..models.swap import Swap, SwapStatus
from ..schemas.user import UserProfile
from ..schemas.skill import SkillOfferedInDB
from ..schemas.swap import SwapWithDetails

router = APIRouter(prefix="/admin", tags=["admin"])


# User management
@router.get("/users", response_model=List[UserProfile])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Get all users (admin only)
    """
    return db.query(User).offset(skip).limit(limit).all()


@router.put("/users/{user_id}/ban", response_model=UserProfile)
async def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Ban a user (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot ban an admin user"
        )
    
    user.is_banned = True
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/users/{user_id}/unban", response_model=UserProfile)
async def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Unban a user (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_banned = False
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/users/{user_id}/make-admin", response_model=UserProfile)
async def make_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Make a user an admin (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = UserRole.ADMIN
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


# Skill moderation
@router.get("/skills/pending", response_model=List[SkillOfferedInDB])
async def get_pending_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Get all pending skills (admin only)
    """
    return db.query(SkillOffered).filter(SkillOffered.status == SkillStatus.PENDING).all()


@router.put("/skills/{skill_id}/approve", response_model=SkillOfferedInDB)
async def approve_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Approve a skill (admin only)
    """
    skill = db.query(SkillOffered).filter(SkillOffered.id == skill_id).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill.status = SkillStatus.APPROVED
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill


@router.put("/skills/{skill_id}/reject", response_model=SkillOfferedInDB)
async def reject_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Reject a skill (admin only)
    """
    skill = db.query(SkillOffered).filter(SkillOffered.id == skill_id).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill.status = SkillStatus.REJECTED
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill


# Swap monitoring
@router.get("/swaps", response_model=List[SwapWithDetails])
async def get_all_swaps(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Get all swaps (admin only)
    """
    query = db.query(Swap).options(
        joinedload(Swap.requester),
        joinedload(Swap.provider),
        joinedload(Swap.skill_offered),
        joinedload(Swap.skill_wanted)
    )
    
    if status:
        query = query.filter(Swap.status == status)
    
    return query.offset(skip).limit(limit).all()


# Statistics
@router.get("/stats")
async def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Get platform statistics (admin only)
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_skills_offered = db.query(func.count(SkillOffered.id)).scalar()
    total_skills_wanted = db.query(func.count(SkillWanted.id)).scalar()
    
    # Swaps by status
    swaps_by_status = {}
    for status_value in SwapStatus:
        count = db.query(func.count(Swap.id)).filter(Swap.status == status_value).scalar()
        swaps_by_status[status_value.value] = count
    
    # Active users (users with at least one swap)
    active_users = db.query(func.count(User.id.distinct())).join(
        Swap, (User.id == Swap.requester_id) | (User.id == Swap.provider_id)
    ).scalar()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_skills_offered": total_skills_offered,
        "total_skills_wanted": total_skills_wanted,
        "swaps_by_status": swaps_by_status,
        "total_swaps": sum(swaps_by_status.values())
    }


# Platform-wide messaging
@router.post("/message")
async def send_platform_message(
    message: str,
    title: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Send a platform-wide message (admin only)
    """
    # In a real application, this would send emails or push notifications
    # Here we'll just simulate it with a background task
    
    def send_messages():
        # Get all active users
        users = db.query(User).filter(User.is_active == True, User.is_banned == False).all()
        
        # In a real app, send messages to each user
        print(f"Sending message '{title}' to {len(users)} users: {message}")
    
    background_tasks.add_task(send_messages)
    
    return {"status": "Message sending started", "recipients_count": db.query(func.count(User.id)).filter(User.is_active == True, User.is_banned == False).scalar()}
